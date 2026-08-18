class HomographyManager {

    constructor(calibrationManager) {

        this.calibrationManager =
            calibrationManager || null;

        this.matrix = null;

        this.initialized = false;

        this.sourcePoints = null;

        // Dimensions de la vraie planche dans l'espace rectifié.
        this.boardOutputWidth = 1200;

        this.boardOutputHeight = 600;

        // Marges de vision permettant de conserver les contours qui dépassent.
        this.marginX = 0;

        this.marginY = 0;

        this.updateCanvasSize();
    }


    initialize() {

        if (
            typeof cv === "undefined"
        ) {

            throw new Error(
                "HomographyManager: OpenCV.js non disponible."
            );
        }


        this.initialized = true;


        console.log(
            "HomographyManager initialized."
        );
    }


    setOutputSize(width, height) {

        if (
            !Number.isFinite(width) ||
            !Number.isFinite(height) ||
            width <= 0 ||
            height <= 0
        ) {

            throw new Error(
                "Dimensions de sortie invalides."
            );
        }


        this.boardOutputWidth =
            Math.round(width);

        this.boardOutputHeight =
            Math.round(height);


        this.updateCanvasSize();

        this.invalidate();
    }


    setMargins(marginX, marginY = marginX) {

        if (
            !Number.isFinite(marginX) ||
            !Number.isFinite(marginY) ||
            marginX < 0 ||
            marginY < 0
        ) {

            throw new Error(
                "Marges d'homographie invalides."
            );
        }


        this.marginX =
            Math.round(marginX);

        this.marginY =
            Math.round(marginY);


        this.updateCanvasSize();

        this.invalidate();
    }


    updateCanvasSize() {

        this.outputWidth =
            this.boardOutputWidth +
            (this.marginX * 2);

        this.outputHeight =
            this.boardOutputHeight +
            (this.marginY * 2);
    }


    setSourcePoints(points) {

        if (
            !Array.isArray(points) ||
            points.length !== 4
        ) {

            throw new Error(
                "L'homographie nécessite exactement 4 points."
            );
        }


        this.sourcePoints =
            points.map(point => ({

                x: Number(point.x),

                y: Number(point.y)

            }));


        this.invalidate();
    }


    getSourcePoints() {

        if (!this.sourcePoints) {

            return null;
        }


        return this.sourcePoints.map(
            point => ({
                ...point
            })
        );
    }


    build() {

        if (!this.initialized) {

            throw new Error(
                "HomographyManager non initialisé."
            );
        }


        if (!this.sourcePoints) {

            throw new Error(
                "Les 4 points source ne sont pas définis."
            );
        }


        const src =
            cv.matFromArray(

                4,
                1,
                cv.CV_32FC2,

                [

                    this.sourcePoints[0].x,
                    this.sourcePoints[0].y,

                    this.sourcePoints[1].x,
                    this.sourcePoints[1].y,

                    this.sourcePoints[2].x,
                    this.sourcePoints[2].y,

                    this.sourcePoints[3].x,
                    this.sourcePoints[3].y
                ]
            );


        const dst =
            cv.matFromArray(

                4,
                1,
                cv.CV_32FC2,

                [

                    this.marginX,
                    this.marginY,

                    this.marginX +
                    this.boardOutputWidth,
                    this.marginY,

                    this.marginX +
                    this.boardOutputWidth,
                    this.marginY +
                    this.boardOutputHeight,

                    this.marginX,
                    this.marginY +
                    this.boardOutputHeight
                ]
            );


        this.invalidate();


        this.matrix =
            cv.getPerspectiveTransform(
                src,
                dst
            );


        src.delete();

        dst.delete();


        return this.matrix;
    }


    rectify(frame) {

        if (
            !frame ||
            frame.empty()
        ) {

            throw new Error(
                "Frame OpenCV invalide."
            );
        }


        if (!this.matrix) {

            this.build();
        }


        const result =
            new cv.Mat();


        const size =
            new cv.Size(
                this.outputWidth,
                this.outputHeight
            );


        cv.warpPerspective(

            frame,

            result,

            this.matrix,

            size,

            cv.INTER_LINEAR,

            cv.BORDER_CONSTANT,

            new cv.Scalar(
                0,
                0,
                0,
                255
            )
        );


        return result;
    }


    invalidate() {

        if (this.matrix) {

            this.matrix.delete();

            this.matrix = null;
        }
    }


    getStatus() {

        return {

            initialized:
                this.initialized,

            hasMatrix:
                !!this.matrix,

            sourcePoints:
                this.getSourcePoints(),

            boardOutputWidth:
                this.boardOutputWidth,

            boardOutputHeight:
                this.boardOutputHeight,

            marginX:
                this.marginX,

            marginY:
                this.marginY,

            outputWidth:
                this.outputWidth,

            outputHeight:
                this.outputHeight,

            boardRect: {
                x: this.marginX,
                y: this.marginY,
                width: this.boardOutputWidth,
                height: this.boardOutputHeight
            }
        };
    }


    destroy() {

        this.invalidate();

        this.sourcePoints =
            null;

        this.initialized =
            false;
    }
}


window.HomographyManager =
    HomographyManager;