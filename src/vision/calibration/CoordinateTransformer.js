class CoordinateTransformer {

    constructor(calibrationManager) {

        if (!calibrationManager) {

            throw new Error(
                "CoordinateTransformer: CalibrationManager requis."
            );
        }

        this.calibration =
            calibrationManager;
    }


    pixelToNormalized(
        x,
        y,
        imageWidth,
        imageHeight
    ) {

        if (
            imageWidth <= 0 ||
            imageHeight <= 0
        ) {

            throw new Error(
                "Dimensions image invalides."
            );
        }


        return {

            x: x / imageWidth,

            y: y / imageHeight
        };
    }


    normalizedToMeters(
        x,
        y
    ) {

        const board =
            this.calibration
                .getBoardDimensions();


        return {

            x:
                x * board.width,

            y:
                y * board.length
        };
    }


    pixelToMeters(
        x,
        y,
        imageWidth,
        imageHeight
    ) {

        const normalized =
            this.pixelToNormalized(
                x,
                y,
                imageWidth,
                imageHeight
            );


        return this.normalizedToMeters(
            normalized.x,
            normalized.y
        );
    }
}


window.CoordinateTransformer = CoordinateTransformer;

