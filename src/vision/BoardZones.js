class BoardZones {

    constructor(config = {}) {

        /*
         * Convention physique définitive :
         *
         * X = longueur / progression des palets : 0 → 1200 mm
         * Y = largeur de la planche          : 0 →  600 mm
         */

        this.boardLength =
            config.boardLength ?? 1200;

        this.boardWidth =
            config.boardWidth ?? 600;


        this.validateBoardDimensions(
            this.boardLength,
            this.boardWidth
        );


        /*
         * Alias conservés pour compatibilité avec le prototype précédent.
         *
         * width  = longueur sur X
         * height = largeur sur Y
         */

        this.width =
            this.boardLength;

        this.height =
            this.boardWidth;


        this.configured = false;

        this.foulLineX = null;

        this.zone1EndX = null;

        this.zone2EndX = null;

        this.zone3EndX = null;

        this.zone4EndX = null;

        this.zones = {};


        if (
            BoardZones.hasCompleteZoneConfig(
                config
            )
        ) {

            this.configure(config);
        }
    }


    static hasCompleteZoneConfig(config) {

        return [
            "foulLineX",
            "zone1EndX",
            "zone2EndX",
            "zone3EndX",
            "zone4EndX"
        ].every(
            key =>
                config[key] !== undefined &&
                config[key] !== null
        );
    }


    validateBoardDimensions(
        boardLength,
        boardWidth
    ) {

        if (
            !Number.isFinite(boardLength) ||
            boardLength <= 0
        ) {

            throw new Error(
                "BoardZones: boardLength invalide."
            );
        }


        if (
            !Number.isFinite(boardWidth) ||
            boardWidth <= 0
        ) {

            throw new Error(
                "BoardZones: boardWidth invalide."
            );
        }
    }


    validateZoneConfig(config = {}) {

        const values = {
            foulLineX:
                config.foulLineX,

            zone1EndX:
                config.zone1EndX,

            zone2EndX:
                config.zone2EndX,

            zone3EndX:
                config.zone3EndX,

            zone4EndX:
                config.zone4EndX
        };


        for (
            const [key, value]
            of Object.entries(values)
        ) {

            if (!Number.isFinite(value)) {

                throw new Error(
                    `BoardZones: ${key} doit être un nombre fini.`
                );
            }
        }


        if (values.foulLineX < 0) {

            throw new Error(
                "BoardZones: foulLineX ne peut pas être négatif."
            );
        }


        if (
            !(
                values.foulLineX <
                values.zone1EndX &&

                values.zone1EndX <
                values.zone2EndX &&

                values.zone2EndX <
                values.zone3EndX &&

                values.zone3EndX <
                values.zone4EndX
            )
        ) {

            throw new Error(
                "BoardZones: les limites X doivent être strictement croissantes."
            );
        }


        if (
            values.zone4EndX !==
            this.boardLength
        ) {

            throw new Error(
                "BoardZones: zone4EndX doit être égal à boardLength."
            );
        }


        return values;
    }


    configure(config = {}) {

        /*
         * Validation transactionnelle : aucune valeur interne n'est modifiée
         * tant que toute la configuration n'a pas été validée.
         */

        const values =
            this.validateZoneConfig(config);


        this.foulLineX =
            values.foulLineX;

        this.zone1EndX =
            values.zone1EndX;

        this.zone2EndX =
            values.zone2EndX;

        this.zone3EndX =
            values.zone3EndX;

        this.zone4EndX =
            values.zone4EndX;


        this.zones = {

            zone1: {
                key: "zone1",
                score: 1,
                xMin: this.foulLineX,
                xMax: this.zone1EndX
            },

            zone2: {
                key: "zone2",
                score: 2,
                xMin: this.zone1EndX,
                xMax: this.zone2EndX
            },

            zone3: {
                key: "zone3",
                score: 3,
                xMin: this.zone2EndX,
                xMax: this.zone3EndX
            },

            zone4: {
                key: "zone4",
                score: 4,
                xMin: this.zone3EndX,
                xMax: this.zone4EndX
            }
        };


        this.configured = true;


        return this.getStatus();
    }


    reset() {

        this.configured = false;

        this.foulLineX = null;

        this.zone1EndX = null;

        this.zone2EndX = null;

        this.zone3EndX = null;

        this.zone4EndX = null;

        this.zones = {};
    }


    isConfigured() {

        return this.configured;
    }


    assertConfigured() {

        if (!this.configured) {

            throw new Error(
                "BoardZones: zones non configurées."
            );
        }
    }


    createResult({
        key,
        score,
        centerX,
        zone = null
    }) {

        return {
            key,
            score,
            centerX,
            zone:
                zone
                    ? { ...zone }
                    : null
        };
    }


    getZoneForCenterX(centerX) {

        this.assertConfigured();


        if (!Number.isFinite(centerX)) {

            throw new Error(
                "BoardZones: centerX doit être un nombre fini."
            );
        }


        if (
            centerX < 0 ||
            centerX > this.boardLength
        ) {

            return this.createResult({
                key: "outsideBoard",
                score: 0,
                centerX
            });
        }


        if (centerX < this.foulLineX) {

            return this.createResult({
                key: "beforeFoulLine",
                score: 0,
                centerX
            });
        }


        /*
         * Intervalles semi-ouverts :
         *
         * [foulLineX, zone1EndX[ = Zone 1
         * [zone1EndX, zone2EndX[ = Zone 2
         * [zone2EndX, zone3EndX[ = Zone 3
         * [zone3EndX, boardLength] = Zone 4
         *
         * Un centre exactement sur une ligne appartient donc à la zone
         * supérieure.
         */

        if (centerX < this.zone1EndX) {

            return this.createResult({
                key: "zone1",
                score: 1,
                centerX,
                zone: this.zones.zone1
            });
        }


        if (centerX < this.zone2EndX) {

            return this.createResult({
                key: "zone2",
                score: 2,
                centerX,
                zone: this.zones.zone2
            });
        }


        if (centerX < this.zone3EndX) {

            return this.createResult({
                key: "zone3",
                score: 3,
                centerX,
                zone: this.zones.zone3
            });
        }


        return this.createResult({
            key: "zone4",
            score: 4,
            centerX,
            zone: this.zones.zone4
        });
    }


    getScoreForCenterX(centerX) {

        return this
            .getZoneForCenterX(centerX)
            .score;
    }


    classifyPuck(puck) {

        this.assertConfigured();


        if (
            !puck ||
            typeof puck !== "object"
        ) {

            throw new Error(
                "BoardZones: puck invalide."
            );
        }


        const centerX =
            puck.mmX;

        const centerY =
            puck.mmY;


        if (!Number.isFinite(centerX)) {

            throw new Error(
                "BoardZones: puck.mmX doit être un nombre fini."
            );
        }


        /*
         * Si mmY est disponible, on contrôle également les sorties latérales.
         * L'attribution des zones reste exclusivement basée sur mmX.
         */

        if (
            Number.isFinite(centerY) &&
            (
                centerY < 0 ||
                centerY > this.boardWidth
            )
        ) {

            return {
                ...puck,
                boardZone: "outsideBoard",
                zoneScore: 0,
                zoneResult: this.createResult({
                    key: "outsideBoard",
                    score: 0,
                    centerX
                })
            };
        }


        const result =
            this.getZoneForCenterX(centerX);


        return {
            ...puck,
            boardZone: result.key,
            zoneScore: result.score,
            zoneResult: result
        };
    }


    classifyPucks(pucks = []) {

        this.assertConfigured();


        if (!Array.isArray(pucks)) {

            throw new Error(
                "BoardZones: pucks doit être un tableau."
            );
        }


        return pucks.map(
            puck =>
                this.classifyPuck(puck)
        );
    }


    getConfiguration() {

        if (!this.configured) {
            return null;
        }


        return {
            foulLineX:
                this.foulLineX,

            zone1EndX:
                this.zone1EndX,

            zone2EndX:
                this.zone2EndX,

            zone3EndX:
                this.zone3EndX,

            zone4EndX:
                this.zone4EndX
        };
    }


    getZone(number) {

        if (!this.configured) {
            return null;
        }


        const zone =
            this.zones[
                `zone${number}`
            ];


        return zone
            ? { ...zone }
            : null;
    }


    getAllZones() {

        if (!this.configured) {
            return {};
        }


        return Object.fromEntries(
            Object.entries(this.zones)
                .map(
                    ([key, zone]) => [
                        key,
                        { ...zone }
                    ]
                )
        );
    }


    getStatus() {

        return {
            initialized: true,
            configured: this.configured,

            coordinateSystem: {
                xAxis: "boardLength",
                xMin: 0,
                xMax: this.boardLength,
                yAxis: "boardWidth",
                yMin: 0,
                yMax: this.boardWidth
            },

            boardLength:
                this.boardLength,

            boardWidth:
                this.boardWidth,

            /*
             * Alias de compatibilité :
             * boardWidthLegacy correspond à l'ancienne propriété this.width,
             * donc à la longueur sur X.
             */

            boardWidthLegacy:
                this.width,

            boardHeightLegacy:
                this.height,

            foulLineX:
                this.foulLineX,

            zone1EndX:
                this.zone1EndX,

            zone2EndX:
                this.zone2EndX,

            zone3EndX:
                this.zone3EndX,

            zone4EndX:
                this.zone4EndX,

            zones:
                this.getAllZones(),

            hangerImplemented:
                false
        };
    }
}


if (
    typeof window !== "undefined"
) {

    window.BoardZones =
        BoardZones;
}


if (
    typeof module !== "undefined" &&
    module.exports
) {

    module.exports =
        BoardZones;
}
