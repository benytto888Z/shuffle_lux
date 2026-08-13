class FinalBoardState {

    constructor(detections = []) {

        this.timestamp = Date.now();

        this.board = {
            width: 1200,
            height: 600
        };

        // Règle officielle :
        // 4 pucks par joueur / équipe
        // 8 pucks au départ
        this.expected = {
            blue: 4,
            green: 4,
            total: 8
        };

        this.pucks = [];

        this.bluePucks = [];

        this.greenPucks = [];

        this.invalidPucks = [];

        this.outOfBoardPucks = [];

        /*
         * Données dérivées après homographie :
         *
         * mappedPucks     = coordonnées physiques mm
         * classifiedPucks = zone déterminée par le centre X
         */

        this.mappedPucks = [];

        this.classifiedPucks = [];

        this.valid = false;

        this.validation = {

            totalValid: false,

            blueValid: false,

            greenValid: false,

            colorsValid: true,

            coordinatesValid: true,

            insideBoard: true
        };

        this.build(detections);
    }


    build(detections) {

        if (!Array.isArray(detections)) {

            this.validation.colorsValid =
                false;

            return;
        }


        detections.forEach(
            (puck, index) => {

                if (!puck) {

                    this.invalidPucks.push({

                        index,

                        reason:
                            "Palet invalide"
                    });

                    return;
                }


                const color =
                    puck.color;


                const x =
                    Number(
                        puck.center?.x
                    );


                const y =
                    Number(
                        puck.center?.y
                    );


                const radius =
                    Number(
                        puck.radius
                    );


                /*
                 * Couleur
                 */

                if (
                    color !== "blue" &&
                    color !== "green"
                ) {

                    this.invalidPucks.push({

                        index,

                        reason:
                            "Couleur inconnue",

                        color
                    });

                    this.validation.colorsValid =
                        false;

                    return;
                }


                /*
                 * Coordonnées
                 */

                if (
                    !Number.isFinite(x) ||
                    !Number.isFinite(y)
                ) {

                    this.invalidPucks.push({

                        index,

                        reason:
                            "Coordonnées invalides",

                        color
                    });

                    this.validation.coordinatesValid =
                        false;

                    return;
                }


                const validRadius =
                    Number.isFinite(radius) &&
                    radius > 0;


                const puckData = {

                    id:
                        index + 1,

                    color,

                    x,

                    y,

                    radius:
                        validRadius
                            ? radius
                            : null,

                    diameter:
                        validRadius
                            ? radius * 2
                            : null
                };


                /*
                 * Position sur la planche
                 */

                const inside =
                    x >= 0 &&
                    x <= this.board.width &&
                    y >= 0 &&
                    y <= this.board.height;


                puckData.insideBoard =
                    inside;


                /*
                 * IMPORTANT :
                 *
                 * Un puck hors planche n'est
                 * normalement pas détecté par
                 * la capture finale.
                 *
                 * On le signale simplement.
                 */

                if (!inside) {

                    this.outOfBoardPucks.push(
                        puckData
                    );

                    this.validation.insideBoard =
                        false;
                }


                this.pucks.push(
                    puckData
                );


                if (
                    color === "blue"
                ) {

                    this.bluePucks.push(
                        puckData
                    );

                } else {

                    this.greenPucks.push(
                        puckData
                    );
                }
            }
        );


        /*
         * VALIDATION DU NOMBRE
         *
         * IMPORTANT :
         * 0 à 8 sont tous valides.
         */

        this.validation.totalValid =
            this.pucks.length >= 0 &&
            this.pucks.length <= 8;


        /*
         * Chaque couleur peut avoir
         * entre 0 et 4 pucks.
         */

        this.validation.blueValid =
            this.bluePucks.length >= 0 &&
            this.bluePucks.length <= 4;


        this.validation.greenValid =
            this.greenPucks.length >= 0 &&
            this.greenPucks.length <= 4;


        /*
         * État global
         */

        this.valid =
            this.validation.totalValid &&
            this.validation.blueValid &&
            this.validation.greenValid &&
            this.validation.colorsValid &&
            this.validation.coordinatesValid;
    }


    setZoneAnalysis({
        mappedPucks = [],
        classifiedPucks = []
    } = {}) {

        if (!Array.isArray(mappedPucks)) {

            throw new Error(
                "FinalBoardState: mappedPucks doit être un tableau."
            );
        }


        if (!Array.isArray(classifiedPucks)) {

            throw new Error(
                "FinalBoardState: classifiedPucks doit être un tableau."
            );
        }


        if (
            mappedPucks.length !==
            classifiedPucks.length
        ) {

            throw new Error(
                "FinalBoardState: tailles mapping/classification incompatibles."
            );
        }


        this.mappedPucks =
            mappedPucks.map(
                puck => ({ ...puck })
            );


        this.classifiedPucks =
            classifiedPucks.map(
                puck => ({ ...puck })
            );


        return this.getZoneAnalysis();
    }


    getZoneAnalysis() {

        const counts = {
            beforeFoulLine: 0,
            zone1: 0,
            zone2: 0,
            zone3: 0,
            zone4: 0,
            outsideBoard: 0
        };


        for (
            const puck of
            this.classifiedPucks
        ) {

            if (
                Object.prototype.hasOwnProperty.call(
                    counts,
                    puck.boardZone
                )
            ) {

                counts[puck.boardZone] += 1;
            }
        }


        return {
            mappedCount:
                this.mappedPucks.length,

            classifiedCount:
                this.classifiedPucks.length,

            counts,

            pucks:
                this.classifiedPucks.map(
                    puck => ({ ...puck })
                )
        };
    }


    getPuckCount() {

        return this.pucks.length;
    }


    getBlueCount() {

        return this.bluePucks.length;
    }


    getGreenCount() {

        return this.greenPucks.length;
    }


    getRemovedCount() {

        return (
            8 -
            this.pucks.length
        );
    }


    getPuck(id) {

        return this.pucks.find(
            puck =>
                puck.id === id
        );
    }


    getValidation() {

        return {

            ...this.validation,

            valid:
                this.valid,

            expectedInitial:
                8,

            detected:
                this.pucks.length,

            removed:
                this.getRemovedCount(),

            blue:
                this.bluePucks.length,

            green:
                this.greenPucks.length
        };
    }


    getStatus() {

        return {

            valid:
                this.valid,

            total:
                this.pucks.length,

            blue:
                this.bluePucks.length,

            green:
                this.greenPucks.length,

            removed:
                this.getRemovedCount(),

            invalid:
                this.invalidPucks.length,

            outOfBoard:
                this.outOfBoardPucks.length,

            mapped:
                this.mappedPucks.length,

            zonesClassified:
                this.classifiedPucks.length,

            boardWidth:
                this.board.width,

            boardHeight:
                this.board.height,

            timestamp:
                this.timestamp
        };
    }


    getData() {

        return {

            timestamp:
                this.timestamp,

            board:
                {
                    ...this.board
                },

            expected:
                {
                    ...this.expected
                },

            pucks:
                this.pucks.map(
                    puck => ({
                        ...puck
                    })
                ),

            bluePucks:
                this.bluePucks.map(
                    puck => ({
                        ...puck
                    })
                ),

            greenPucks:
                this.greenPucks.map(
                    puck => ({
                        ...puck
                    })
                ),

            invalidPucks:
                this.invalidPucks.map(
                    puck => ({
                        ...puck
                    })
                ),

            outOfBoardPucks:
                this.outOfBoardPucks.map(
                    puck => ({
                        ...puck
                    })
                ),

            mappedPucks:
                this.mappedPucks.map(
                    puck => ({
                        ...puck
                    })
                ),

            classifiedPucks:
                this.classifiedPucks.map(
                    puck => ({
                        ...puck
                    })
                ),

            zoneAnalysis:
                this.getZoneAnalysis(),

            validation:
                this.getValidation(),

            valid:
                this.valid
        };
    }
}


window.FinalBoardState =
    FinalBoardState;