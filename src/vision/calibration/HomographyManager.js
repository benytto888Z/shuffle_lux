class HomographyManager {

    constructor(calibrationManager) {

        this.calibrationManager =
            calibrationManager || null;

        this.matrix = null;

        this.initialized = false;

        this.sourcePoints = null;

        this.outputWidth = 1200;

        this.outputHeight = 600;
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


        this.outputWidth =
            Math.round(width);

        this.outputHeight =
            Math.round(height);


        this.invalidate();
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

                    0,
                    0,

                    this.outputWidth,
                    0,

                    this.outputWidth,
                    this.outputHeight,

                    0,
                    this.outputHeight
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

            outputWidth:
                this.outputWidth,

            outputHeight:
                this.outputHeight
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