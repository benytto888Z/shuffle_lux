class HangerDetector {

    constructor(config = {}) {

        /*
         * Repère physique définitif :
         *
         * X = longueur de la planche : 0 → boardLength
         * Y = largeur              : 0 → boardWidth
         */

        this.boardLength =
            config.boardLength ?? 1200;

        this.boardWidth =
            config.boardWidth ?? 600;

        /*
         * Tolérance laissée à 0 mm pour respecter la règle officielle :
         * le bord doit réellement toucher ou dépasser l'extrémité.
         * Elle pourra être calibrée plus tard si la mesure caméra le justifie.
         */

        this.contactToleranceMm =
            config.contactToleranceMm ?? 0;


        this.validateConfig();

        this.initialized = true;
    }


    validateConfig() {

        if (
            !Number.isFinite(this.boardLength) ||
            this.boardLength <= 0
        ) {

            throw new Error(
                "HangerDetector: boardLength invalide."
            );
        }


        if (
            !Number.isFinite(this.boardWidth) ||
            this.boardWidth <= 0
        ) {

            throw new Error(
                "HangerDetector: boardWidth invalide."
            );
        }


        if (
            !Number.isFinite(
                this.contactToleranceMm
            ) ||
            this.contactToleranceMm < 0
        ) {

            throw new Error(
                "HangerDetector: contactToleranceMm invalide."
            );
        }
    }


    evaluatePuck(puck) {

        if (
            !puck ||
            typeof puck !== "object"
        ) {

            throw new Error(
                "HangerDetector: puck invalide."
            );
        }


        const centerX =
            Number(puck.mmX);

        const centerY =
            Number(puck.mmY);

        const radiusMm =
            Number(puck.radiusMm);


        const geometryValid =
            Number.isFinite(centerX) &&
            Number.isFinite(centerY) &&
            Number.isFinite(radiusMm) &&
            radiusMm > 0;


        if (!geometryValid) {

            return {
                ...puck,
                hangerGeometryValid: false,
                isHanger: false,
                frontEdgeX: null,
                overhangMm: 0,
                distanceToEndMm: null,
                finalScore:
                    Number.isFinite(puck.zoneScore)
                        ? puck.zoneScore
                        : 0,
                scoreType:
                    puck.boardZone ??
                    "invalidGeometry"
            };
        }


        const centerInsideBoard =
            centerX >= 0 &&
            centerX <= this.boardLength &&
            centerY >= 0 &&
            centerY <= this.boardWidth;


        const frontEdgeX =
            centerX + radiusMm;

        const hangerThresholdX =
            this.boardLength -
            this.contactToleranceMm;


        const isHanger =
            centerInsideBoard &&
            frontEdgeX >= hangerThresholdX;


        const overhangMm =
            Math.max(
                0,
                frontEdgeX -
                this.boardLength
            );


        const distanceToEndMm =
            this.boardLength -
            frontEdgeX;


        return {
            ...puck,
            hangerGeometryValid: true,
            centerInsideBoard,
            frontEdgeX,
            hangerThresholdX,
            overhangMm,
            distanceToEndMm,
            isHanger,

            /*
             * Priorité métier : HANGER écrase la Zone 4.
             */

            finalScore:
                isHanger
                    ? 5
                    : (
                        Number.isFinite(
                            puck.zoneScore
                        )
                            ? puck.zoneScore
                            : 0
                    ),

            scoreType:
                isHanger
                    ? "hanger"
                    : (
                        puck.boardZone ??
                        "unclassified"
                    )
        };
    }


    evaluatePucks(pucks = []) {

        if (!Array.isArray(pucks)) {

            throw new Error(
                "HangerDetector: pucks doit être un tableau."
            );
        }


        return pucks.map(
            puck =>
                this.evaluatePuck(puck)
        );
    }


    getHangers(pucks = []) {

        return this
            .evaluatePucks(pucks)
            .filter(
                puck =>
                    puck.isHanger
            );
    }


    setContactToleranceMm(value) {

        if (
            !Number.isFinite(value) ||
            value < 0
        ) {

            throw new Error(
                "HangerDetector: tolérance invalide."
            );
        }


        this.contactToleranceMm =
            value;


        return this.getStatus();
    }


    getStatus() {

        return {
            initialized:
                this.initialized,

            boardLength:
                this.boardLength,

            boardWidth:
                this.boardWidth,

            contactToleranceMm:
                this.contactToleranceMm,

            rule:
                "frontEdgeX >= boardLength - contactToleranceMm",

            score:
                5
        };
    }
}


if (
    typeof window !== "undefined"
) {

    window.HangerDetector =
        HangerDetector;
}


if (
    typeof module !== "undefined" &&
    module.exports
) {

    module.exports =
        HangerDetector;
}
