class BoardCoordinateMapper {

    constructor(config = {}) {

        this.pixelWidth =
            config.pixelWidth ?? 1200;

        this.pixelHeight =
            config.pixelHeight ?? 600;

        this.boardWidthMm =
            config.boardWidthMm ?? 1200;

        this.boardHeightMm =
            config.boardHeightMm ?? 600;
    }


    pixelToMm(x, y) {

        const mmX =
            (x / this.pixelWidth) *
            this.boardWidthMm;

        const mmY =
            (y / this.pixelHeight) *
            this.boardHeightMm;


        return {

            x: mmX,

            y: mmY
        };
    }


    mmToPixel(x, y) {

        const pixelX =
            (x / this.boardWidthMm) *
            this.pixelWidth;

        const pixelY =
            (y / this.boardHeightMm) *
            this.pixelHeight;


        return {

            x: pixelX,

            y: pixelY
        };
    }


    pixelRadiusToMm(radius) {

        if (
            !Number.isFinite(radius)
        ) {

            return null;
        }


        const scaleX =
            this.boardWidthMm /
            this.pixelWidth;


        const scaleY =
            this.boardHeightMm /
            this.pixelHeight;


        const scale =
            (scaleX + scaleY) / 2;


        return radius * scale;
    }


    pixelDiameterToMm(diameter) {

        if (
            !Number.isFinite(diameter)
        ) {

            return null;
        }


        return this.pixelRadiusToMm(
            diameter / 2
        ) * 2;
    }


    mapPuck(puck) {

        if (!puck) {

            return null;
        }


        const position =
            this.pixelToMm(
                puck.x,
                puck.y
            );


        const radiusMm =
            this.pixelRadiusToMm(
                puck.radius
            );


        const diameterMm =
            radiusMm !== null
                ? radiusMm * 2
                : null;


        return {

            ...puck,

            mmX:
                position.x,

            mmY:
                position.y,

            radiusMm,

            diameterMm
        };
    }


    mapPucks(pucks = []) {

        return pucks.map(
            puck =>
                this.mapPuck(puck)
        );
    }


    isInsideBoardMm(x, y) {

        return (

            x >= 0 &&
            x <= this.boardWidthMm &&

            y >= 0 &&
            y <= this.boardHeightMm
        );
    }


    clampMm(x, y) {

        return {

            x:
                Math.max(
                    0,
                    Math.min(
                        this.boardWidthMm,
                        x
                    )
                ),

            y:
                Math.max(
                    0,
                    Math.min(
                        this.boardHeightMm,
                        y
                    )
                )
        };
    }


    getStatus() {

        return {

            pixelWidth:
                this.pixelWidth,

            pixelHeight:
                this.pixelHeight,

            boardWidthMm:
                this.boardWidthMm,

            boardHeightMm:
                this.boardHeightMm,

            scaleX:
                this.boardWidthMm /
                this.pixelWidth,

            scaleY:
                this.boardHeightMm /
                this.pixelHeight
        };
    }
}


window.BoardCoordinateMapper =
    BoardCoordinateMapper;