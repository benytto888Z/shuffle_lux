class CalibrationManager {

 constructor(options = {}) {

        this.storageKey =
            options.storageKey ||
            "amz-shuffleboard-calibration";

        /*
         * ============================================================
         * PARAMETRES GLOBAUX
         * ============================================================
         */

        this.params = {

            /*
             * Dimensions physiques de la planche
             *
             * Prototype actuel :
             * 1.20 m × 0.60 m
             */
            board: {

                lengthM:
                    options.board?.lengthM ??
                    1.20,

                widthM:
                    options.board?.widthM ??
                    0.60
            },


            /*
             * Palet
             */
            puck: {

                diameterM:
                    options.puck?.diameterM ??
                    0.075,

                thicknessM:
                    options.puck?.thicknessM ??
                    0.020
            },


            /*
             * Caméra
             */
            camera: {

                heightM:
                    options.camera?.heightM ??
                    1.25,

                /*
                 * Résolution souhaitée.
                 * La caméra réelle peut avoir une autre résolution.
                 */
                width:
                    options.camera?.width ??
                    1920,

                height:
                    options.camera?.height ??
                    1080,

                fps:
                    options.camera?.fps ??
                    30
            },


            /*
             * Zone réellement analysée.
             *
             * Vision à partir du haut de la planche.
             */
            vision: {

                startFromTopM:
                    options.vision?.startFromTopM ??
                    0.00,

                lengthM:
                    options.vision?.lengthM ??
                    1.15,

                faultLineMarginM:
                    options.vision?.faultLineMarginM ??
                    0.05
            },


            /*
             * Couleurs de calibration.
             *
             * IMPORTANT :
             * Elles sont des paramètres et non des constantes.
             */
            lines: {

                zoneLineColor:
                    options.lines?.zoneLineColor ??
                    "#FFFFFF",

                faultLineColor:
                    options.lines?.faultLineColor ??
                    "#000000",

                faultLineStyle:
                    options.lines?.faultLineStyle ??
                    "dashed"
            },


            /*
             * Zones de score.
             *
             * Pour notre Shuffleboard :
             *
             * Zone 1 = 1 point
             * Zone 2 = 2 points
             * Zone 3 = 3 points
             * Zone 4 = 4 points
             * HANGER = 5 points
             */
            scoring: {

                zone1:
                    options.scoring?.zone1 ??
                    1,

                zone2:
                    options.scoring?.zone2 ??
                    2,

                zone3:
                    options.scoring?.zone3 ??
                    3,

                zone4:
                    options.scoring?.zone4 ??
                    4,

                hanger:
                    options.scoring?.hanger ??
                    5
            },


            /*
             * Calibration OpenCV
             */
            homography: {

                /*
                 * Résolution de sortie de référence.
                 *
                 * 600 × 1200 pour le prototype.
                 */
                outputWidth:
                    options.homography?.outputWidth ??
                    1200,

                outputHeight:
                    options.homography?.outputHeight ??
                    600
            }
        };


        /*
         * Points caméra.
         *
         * Ordre obligatoire :
         *
         * P1 = haut gauche
         * P2 = haut droit
         * P3 = bas droit
         * P4 = bas gauche
         */
        this.sourcePoints =
            options.sourcePoints ??
            null;


        /*
         * Chargement de la calibration sauvegardée.
         */
        this.load();
    }


    /* ================================================================
     * DIMENSIONS
     * ================================================================ */

    getBoardLength() {

        return this.params.board.lengthM;
    }


    getBoardWidth() {

        return this.params.board.widthM;
    }


    setBoardDimensions(lengthM, widthM) {

        if (
            !Number.isFinite(lengthM) ||
            lengthM <= 0
        ) {
            throw new Error(
                "La longueur de la planche doit être > 0."
            );
        }


        if (
            !Number.isFinite(widthM) ||
            widthM <= 0
        ) {
            throw new Error(
                "La largeur de la planche doit être > 0."
            );
        }


        this.params.board.lengthM =
            lengthM;

        this.params.board.widthM =
            widthM;


        this.updateOutputResolution();
    }


    /* ================================================================
     * RESOLUTION HOMOGRAPHIE
     * ================================================================ */

    updateOutputResolution() {

        const width =
            this.params.homography.outputWidth;


        const ratio =
            this.params.board.lengthM /
            this.params.board.widthM;


        this.params.homography.outputHeight =
            Math.round(width * ratio);
    }


    getOutputSize() {

        this.updateOutputResolution();

        return {

            width:
                this.params.homography.outputWidth,

            height:
                this.params.homography.outputHeight
        };
    }


    setOutputWidth(width) {

        if (
            !Number.isFinite(width) ||
            width <= 0
        ) {
            throw new Error(
                "La largeur de sortie doit être > 0."
            );
        }


        this.params.homography.outputWidth =
            Math.round(width);


        this.updateOutputResolution();
    }


    /* ================================================================
     * CAMERA
     * ================================================================ */

    setCameraHeight(heightM) {

        if (
            !Number.isFinite(heightM) ||
            heightM <= 0
        ) {
            throw new Error(
                "La hauteur caméra doit être > 0."
            );
        }


        this.params.camera.heightM =
            heightM;
    }


    getCameraParameters() {

        return {
            ...this.params.camera
        };
    }


    /* ================================================================
     * ZONE DE VISION
     * ================================================================ */

    setVisionLength(lengthM) {

        if (
            !Number.isFinite(lengthM) ||
            lengthM <= 0
        ) {
            throw new Error(
                "La longueur de vision doit être > 0."
            );
        }


        this.params.vision.lengthM =
            lengthM;
    }


    getVisionParameters() {

        return {
            ...this.params.vision
        };
    }


    /* ================================================================
     * COULEURS
     * ================================================================ */

    setLineColors({
        zoneLineColor,
        faultLineColor,
        faultLineStyle
    } = {}) {

        if (zoneLineColor) {

            this.params.lines.zoneLineColor =
                zoneLineColor;
        }


        if (faultLineColor) {

            this.params.lines.faultLineColor =
                faultLineColor;
        }


        if (faultLineStyle) {

            this.params.lines.faultLineStyle =
                faultLineStyle;
        }
    }


    getLineColors() {

        return {
            ...this.params.lines
        };
    }


    /* ================================================================
     * POINTS DE CALIBRATION
     * ================================================================ */

    setSourcePoints(points) {

        if (
            !Array.isArray(points) ||
            points.length !== 4
        ) {
            throw new Error(
                "Il faut exactement 4 points de calibration."
            );
        }


        for (const point of points) {

            if (
                !Number.isFinite(point.x) ||
                !Number.isFinite(point.y)
            ) {
                throw new Error(
                    "Chaque point doit contenir x et y."
                );
            }
        }


        this.sourcePoints =
            points.map(point => ({
                x: Number(point.x),
                y: Number(point.y)
            }));
    }


    getSourcePoints() {

        if (!this.sourcePoints) {

            return null;
        }


        return this.sourcePoints.map(point => ({
            ...point
        }));
    }


    clearSourcePoints() {

        this.sourcePoints = null;
    }


    /* ================================================================
     * SCORE
     * ================================================================ */

    getScoringRules() {

        return {
            ...this.params.scoring
        };
    }


    /* ================================================================
     * PARAMETRES COMPLETS
     * ================================================================ */

    getParameters() {

        return {

            params:
                structuredClone(this.params),

            sourcePoints:
                this.getSourcePoints()
        };
    }


    setParameters(parameters = {}) {

        if (parameters.params) {

            this.params = {

                ...this.params,

                ...parameters.params,

                board: {
                    ...this.params.board,
                    ...parameters.params.board
                },

                puck: {
                    ...this.params.puck,
                    ...parameters.params.puck
                },

                camera: {
                    ...this.params.camera,
                    ...parameters.params.camera
                },

                vision: {
                    ...this.params.vision,
                    ...parameters.params.vision
                },

                lines: {
                    ...this.params.lines,
                    ...parameters.params.lines
                },

                scoring: {
                    ...this.params.scoring,
                    ...parameters.params.scoring
                },

                homography: {
                    ...this.params.homography,
                    ...parameters.params.homography
                }
            };
        }


        if (
            parameters.sourcePoints !== undefined
        ) {

            this.setSourcePoints(
                parameters.sourcePoints
            );
        }


        this.updateOutputResolution();
    }


    /* ================================================================
     * SAUVEGARDE
     * ================================================================ */

    save() {

        const data = {

            params:
                this.params,

            sourcePoints:
                this.sourcePoints
        };


        localStorage.setItem(
            this.storageKey,
            JSON.stringify(data)
        );


        return true;
    }


    /* ================================================================
     * CHARGEMENT
     * ================================================================ */

    load() {

        try {

            const raw =
                localStorage.getItem(
                    this.storageKey
                );


            if (!raw) {

                this.updateOutputResolution();

                return false;
            }


            const data =
                JSON.parse(raw);


            this.setParameters(data);


            return true;

        } catch (error) {

            console.error(
                "CalibrationManager.load():",
                error
            );


            this.updateOutputResolution();

            return false;
        }
    }


    /* ================================================================
     * RESET
     * ================================================================ */

    reset() {

        localStorage.removeItem(
            this.storageKey
        );


        this.sourcePoints = null;


        this.params.board.lengthM =
            1.20;

        this.params.board.widthM =
            0.60;

        this.params.camera.heightM =
            1.25;

        this.params.vision.lengthM =
            1.15;

        this.params.lines.zoneLineColor =
            "#FFFFFF";

        this.params.lines.faultLineColor =
            "#000000";


        this.params.homography.outputWidth =
            1200;


        this.updateOutputResolution();
    }
}


window.CalibrationManager = CalibrationManager;