class CalibrationManager {

    constructor() {

        this.board = {

            lengthM: 1.20,

            widthM: 0.60
        };


        this.camera = {

            heightM: 1.25
        };


        this.vision = {

            lengthM: 1.15
        };


        this.sourcePoints = [];

        this.isCalibrated = false;
    }


    getBoard() {

        return {

            ...this.board
        };
    }


    setBoardDimensions(
        lengthM,
        widthM
    ) {

        if (
            !Number.isFinite(lengthM) ||
            !Number.isFinite(widthM) ||
            lengthM <= 0 ||
            widthM <= 0
        ) {

            throw new Error(
                "Dimensions de planche invalides."
            );
        }


        this.board.lengthM =
            lengthM;

        this.board.widthM =
            widthM;


        this.isCalibrated =
            false;
    }


    setCameraHeight(
        heightM
    ) {

        if (
            !Number.isFinite(heightM) ||
            heightM <= 0
        ) {

            throw new Error(
                "Hauteur caméra invalide."
            );
        }


        this.camera.heightM =
            heightM;
    }


    setVisionLength(
        lengthM
    ) {

        if (
            !Number.isFinite(lengthM) ||
            lengthM <= 0
        ) {

            throw new Error(
                "Longueur de vision invalide."
            );
        }


        this.vision.lengthM =
            lengthM;
    }


    setSourcePoints(
        points
    ) {

        if (
            !Array.isArray(points) ||
            points.length !== 4
        ) {

            throw new Error(
                "4 points sont nécessaires."
            );
        }


        this.sourcePoints =
            points.map(
                point => ({

                    x: Number(point.x),

                    y: Number(point.y)

                })
            );


        this.isCalibrated =
            false;
    }


    getSourcePoints() {

        return this.sourcePoints.map(
            point => ({
                ...point
            })
        );
    }


    clearSourcePoints() {

        this.sourcePoints = [];

        this.isCalibrated =
            false;
    }


    validate() {

        if (
            this.sourcePoints.length !== 4
        ) {

            return false;
        }


        for (
            const point
            of this.sourcePoints
        ) {

            if (
                !Number.isFinite(point.x) ||
                !Number.isFinite(point.y)
            ) {

                return false;
            }
        }


        return true;
    }


    markCalibrated() {

        if (!this.validate()) {

            throw new Error(
                "Calibration invalide."
            );
        }


        this.isCalibrated =
            true;
    }


    getStatus() {

        return {

            board: {
                ...this.board
            },

            camera: {
                ...this.camera
            },

            vision: {
                ...this.vision
            },

            sourcePoints:
                this.getSourcePoints(),

            pointCount:
                this.sourcePoints.length,

            isCalibrated:
                this.isCalibrated
        };
    }
}


window.CalibrationManager =
    CalibrationManager;