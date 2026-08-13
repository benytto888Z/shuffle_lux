class PuckDetector {

    constructor(config = {}) {

        /*
         * ================================================
         * PARAMÈTRES GÉNÉRAUX
         * ================================================
         */

        this.minRadius =
            config.minRadius ?? 10;

        this.maxRadius =
            config.maxRadius ?? 100;


        /*this.minArea =
            config.minArea ?? 200;*/

        this.minArea =
            config.minArea ?? 800;


        this.maxArea =
            config.maxArea ?? 15000;


        /*
         * Circularité minimale.
         *
         * Un cercle parfait = 1.
         */

        this.minCircularity =
            config.minCircularity ?? 0.55;


        /*
         * ================================================
         * COULEURS HSV
         * ================================================
         */


        /* blue: {

                lower: [90, 60, 50],

                upper: [140, 255, 255]
            }

            blue: {
                lower: [95, 90, 60],
                upper: [135, 255, 255],
            },
        */

        this.colors = {

            /*blue: {

                lower: [90, 60, 50],

                upper: [140, 255, 255]
            },*/

            blue: {
                lower: [95, 90, 60],
                upper: [135, 255, 255],
            },

            /*
            green: {

                lower: [35, 70, 40],

                upper: [90, 255, 255]
            }*/

                green: { lower: [40, 100, 70], upper: [85, 255, 255] },
        };


        /*
         * ================================================
         * ÉTAT
         * ================================================
         */

        this.initialized =
            true;
    }


    /*
     * =====================================================
     * DÉTECTION PRINCIPALE
     * =====================================================
     */

   
    detect(frame) {

        if (!frame) {

            throw new Error(
                "PuckDetector : frame absente."
            );
        }


        if (
            typeof cv === "undefined"
        ) {

            throw new Error(
                "OpenCV.js n'est pas disponible."
            );
        }


        const hsv =
            new cv.Mat();


        try {

            cv.cvtColor(
                frame,
                hsv,
                cv.COLOR_RGBA2RGB
            );

            cv.cvtColor(
                hsv,
                hsv,
                cv.COLOR_RGB2HSV
            );


            const results = [];


            /*
             * BLEU
             */

            const bluePucks =
                this.detectColor(
                    hsv,
                    "blue"
                );


            /*
             * VERT
             */

            const greenPucks =
                this.detectColor(
                    hsv,
                    "green"
                );


            results.push(
                ...bluePucks
            );


            results.push(
                ...greenPucks
            );


            return results;

        } finally {

            hsv.delete();
        }
    }

    /*
     * =====================================================
     * DÉTECTION PAR COULEUR
     * =====================================================
     */



    detectColor(
        hsv,
        color
    ) {

        const mask =
            new cv.Mat();


        try {

            if (
                color === "blue"
            ) {

                return this.detectBlue(
                    hsv,
                    mask
                );
            }


            if (
                color === "green"
            ) {

                return this.detectGreen(
                    hsv,
                    mask
                );
            }


            return [];

        } finally {

            mask.delete();
        }
    }
    /*
     * =====================================================
     * GREEN
     * =====================================================
     */

    detectGreen(
        hsv,
        mask
    ) {

        const config =
            this.colors.green;


        const lower =
            new cv.Mat(
                hsv.rows,
                hsv.cols,
                hsv.type(),
                new cv.Scalar(
                    config.lower[0],
                    config.lower[1],
                    config.lower[2],
                    0
                )
            );


        const upper =
            new cv.Mat(
                hsv.rows,
                hsv.cols,
                hsv.type(),
                new cv.Scalar(
                    config.upper[0],
                    config.upper[1],
                    config.upper[2],
                    0
                )
            );


        try {

            cv.inRange(
                hsv,
                lower,
                upper,
                mask
            );


            return this.extractContours(
                mask,
                "green"
            );

        } finally {

            lower.delete();
            upper.delete();
        }
    }
    /*
     * =====================================================
     * BLEU
     * =====================================================
     */

    detectBlue(
        hsv,
        mask
    ) {

        const config =
            this.colors.blue;

        const lower =
            new cv.Mat(
                hsv.rows,
                hsv.cols,
                hsv.type(),
                new cv.Scalar(
                    config.lower[0],
                    config.lower[1],
                    config.lower[2],
                    0
                )
            );

        const upper =
            new cv.Mat(
                hsv.rows,
                hsv.cols,
                hsv.type(),
                new cv.Scalar(
                    config.upper[0],
                    config.upper[1],
                    config.upper[2],
                    0
                )
            );


        try {

            cv.inRange(
                hsv,
                lower,
                upper,
                mask
            );


            return this.extractContours(
                mask,
                "blue"
            );

        } finally {

            lower.delete();
            upper.delete();
        }
    }


    /*
     * =====================================================
     * CONTOURS
     * =====================================================
     */

    extractContours(
        mask,
        color
    ) {

        /*
         * =====================================================
         * NETTOYAGE DU MASQUE
         * =====================================================
         */

        const kernelOpen =
            cv.getStructuringElement(
                cv.MORPH_ELLIPSE,
                new cv.Size(3, 3)
            );


        const kernelClose =
            cv.getStructuringElement(
                cv.MORPH_ELLIPSE,
                new cv.Size(5, 5)
            );

        /*const kernelClose =
            cv.getStructuringElement(
                cv.MORPH_ELLIPSE,
                new cv.Size(11, 11)
            );*/


        const cleaned =
            new cv.Mat();


        try {

            /*
             * Suppression du petit bruit.
             */

            cv.morphologyEx(
                mask,
                cleaned,
                cv.MORPH_OPEN,
                kernelOpen
            );


            /*
             * Referme les petits trous dans les palets.
             */

            cv.morphologyEx(
                cleaned,
                cleaned,
                cv.MORPH_CLOSE,
                kernelClose
            );


            /*
             * ================================================
             * CONTOURS
             * ================================================
             */

            const contours =
                new cv.MatVector();


            const hierarchy =
                new cv.Mat();


            try {

                cv.findContours(
                    cleaned,
                    contours,
                    hierarchy,
                    cv.RETR_EXTERNAL,
                    cv.CHAIN_APPROX_SIMPLE
                );


                const pucks = [];


                for (
                    let i = 0; i < contours.size(); i++
                ) {

                    const contour =
                        contours.get(i);


                    try {

                        const puck =
                            this.analyzeContour(
                                contour,
                                color
                            );


                        if (puck) {

                            pucks.push(
                                puck
                            );
                        }

                    } finally {

                        contour.delete();
                    }
                }


                return pucks;


            } finally {

                contours.delete();

                hierarchy.delete();
            }


        } finally {

            kernelOpen.delete();

            kernelClose.delete();

            cleaned.delete();
        }
    }


    /*
     * =====================================================
     * ANALYSE D'UN CONTOUR
     * =====================================================
     */

    analyzeContour(
        contour,
        color
    ) {

        const area =
            cv.contourArea(
                contour
            );


        if (
            area <
            this.minArea
        ) {

            return null;
        }


        if (
            area >
            this.maxArea
        ) {

            return null;
        }


        /*
         * Périmètre.
         */

        const perimeter =
            cv.arcLength(
                contour,
                true
            );


        if (
            perimeter <= 0
        ) {

            return null;
        }


        /*
         * Circularité :
         *
         * 4πA / P²
         */

        const circularity =
            (
                4 *
                Math.PI *
                area
            ) /
            (
                perimeter *
                perimeter
            );


        if (
            circularity <
            this.minCircularity
        ) {

            return null;
        }


        /*
         * Cercle englobant.
         */

        const circle =
            cv.minEnclosingCircle(
                contour
            );


        const center =
            circle.center;

        const radius =
            circle.radius;


        if (
            radius <
            this.minRadius
        ) {

            return null;
        }


        if (
            radius >
            this.maxRadius
        ) {

            return null;
        }


        /*
         * Bounding box.
         */

        const rect =
            cv.boundingRect(
                contour
            );


        /*
         * Confiance.
         */

        const confidence =
            this.calculateConfidence({

                area,

                radius,

                circularity,

                rect
            });


        return {

            id: null,

            color,

            center: {

                x: center.x,

                y: center.y
            },

            radius,

            diameter: radius * 2,

            area,

            circularity,

            boundingBox: {

                x: rect.x,

                y: rect.y,

                width: rect.width,

                height: rect.height
            },

            confidence
        };
    }


    /*
     * =====================================================
     * CONFIANCE
     * =====================================================
     */

    calculateConfidence({
        area,
        radius,
        circularity,
        rect
    }) {

        /*
         * Circularité.
         */

        const circularityScore =
            Math.min(
                circularity,
                1
            );


        /*
         * Rapport largeur / hauteur.
         */

        const ratio =
            rect.width /
            rect.height;


        const shapeScore =
            Math.max(
                0,
                1 -
                Math.abs(
                    1 - ratio
                )
            );


        /*
         * Taille.
         */

        const expectedArea =
            Math.PI *
            radius *
            radius;


        const areaScore =
            Math.min(
                area /
                expectedArea,
                1
            );


        /*
         * Score global.
         */

        const score =
            (
                circularityScore *
                0.50
            ) +
            (
                shapeScore *
                0.30
            ) +
            (
                areaScore *
                0.20
            );


        return Math.max(
            0,
            Math.min(
                1,
                score
            )
        );
    }


    /*
     * =====================================================
     * PARAMÈTRES
     * =====================================================
     */

    setRadiusRange(
        min,
        max
    ) {

        if (
            !Number.isFinite(min) ||
            !Number.isFinite(max) ||
            min <= 0 ||
            max <= min
        ) {

            throw new Error(
                "Plage de rayon invalide."
            );
        }


        this.minRadius =
            min;

        this.maxRadius =
            max;
    }


    setAreaRange(
        min,
        max
    ) {

        if (
            !Number.isFinite(min) ||
            !Number.isFinite(max) ||
            min <= 0 ||
            max <= min
        ) {

            throw new Error(
                "Plage d'aire invalide."
            );
        }


        this.minArea =
            min;

        this.maxArea =
            max;
    }


    setCircularity(
        value
    ) {

        if (
            !Number.isFinite(value) ||
            value <= 0 ||
            value > 1
        ) {

            throw new Error(
                "Circularité invalide."
            );
        }


        this.minCircularity =
            value;
    }

    debugRedContours(frame) {

        const hsv =
            new cv.Mat();

        const mask =
            new cv.Mat();

        const mask1 =
            new cv.Mat();

        const mask2 =
            new cv.Mat();

        const config =
            this.colors.red;

        const lower1 =
            new cv.Mat(
                frame.rows,
                frame.cols,
                cv.CV_8UC3,
                new cv.Scalar(
                    config.lower1[0],
                    config.lower1[1],
                    config.lower1[2],
                    0
                )
            );

        const upper1 =
            new cv.Mat(
                frame.rows,
                frame.cols,
                cv.CV_8UC3,
                new cv.Scalar(
                    config.upper1[0],
                    config.upper1[1],
                    config.upper1[2],
                    0
                )
            );

        const lower2 =
            new cv.Mat(
                frame.rows,
                frame.cols,
                cv.CV_8UC3,
                new cv.Scalar(
                    config.lower2[0],
                    config.lower2[1],
                    config.lower2[2],
                    0
                )
            );

        const upper2 =
            new cv.Mat(
                frame.rows,
                frame.cols,
                cv.CV_8UC3,
                new cv.Scalar(
                    config.upper2[0],
                    config.upper2[1],
                    config.upper2[2],
                    0
                )
            );


        try {

            cv.cvtColor(
                frame,
                hsv,
                cv.COLOR_RGBA2RGB
            );

            cv.cvtColor(
                hsv,
                hsv,
                cv.COLOR_RGB2HSV
            );


            cv.inRange(
                hsv,
                lower1,
                upper1,
                mask1
            );

            cv.inRange(
                hsv,
                lower2,
                upper2,
                mask2
            );

            cv.bitwise_or(
                mask1,
                mask2,
                mask
            );


            const contours =
                new cv.MatVector();

            const hierarchy =
                new cv.Mat();


            try {

                cv.findContours(
                    mask,
                    contours,
                    hierarchy,
                    cv.RETR_EXTERNAL,
                    cv.CHAIN_APPROX_SIMPLE
                );


                console.log(
                    "========== DEBUG ROUGE =========="
                );

                console.log(
                    "Contours trouvés :",
                    contours.size()
                );


                for (
                    let i = 0; i < contours.size(); i++
                ) {

                    const contour =
                        contours.get(i);


                    try {

                        const area =
                            cv.contourArea(
                                contour
                            );


                        const perimeter =
                            cv.arcLength(
                                contour,
                                true
                            );


                        const circularity =
                            perimeter > 0 ?
                            (
                                4 *
                                Math.PI *
                                area
                            ) /
                            (
                                perimeter *
                                perimeter
                            ) :
                            0;


                        const circle =
                            cv.minEnclosingCircle(
                                contour
                            );


                        const radius =
                            circle.radius;


                        const rect =
                            cv.boundingRect(
                                contour
                            );


                        const accepted =
                            area >= this.minArea &&
                            area <= this.maxArea &&
                            circularity >= this.minCircularity &&
                            radius >= this.minRadius &&
                            radius <= this.maxRadius;


                        if (
                            accepted ||
                            radius > 20
                        ) {

                            console.log(
                                `Rouge #${i + 1}`, {
                                    area,
                                    circularity,
                                    radius,

                                    center: {
                                        x: circle.center.x,
                                        y: circle.center.y
                                    },

                                    accepted
                                }
                            );
                        }

                    } finally {

                        contour.delete();
                    }
                }

            } finally {

                contours.delete();
                hierarchy.delete();
            }

        } finally {

            hsv.delete();

            mask.delete();

            mask1.delete();

            mask2.delete();

            lower1.delete();

            upper1.delete();

            lower2.delete();

            upper2.delete();
        }
    }


    /*
     * =====================================================
     * STATUS
     * =====================================================
     */

    getStatus() {

        return {

            initialized: this.initialized,

            minRadius: this.minRadius,

            maxRadius: this.maxRadius,

            minArea: this.minArea,

            maxArea: this.maxArea,

            minCircularity: this.minCircularity,

            colors: this.colors
        };
    }

    debugColorDetection(frame, color) {

        const hsv =
            new cv.Mat();

        try {

            cv.cvtColor(
                frame,
                hsv,
                cv.COLOR_RGBA2RGB
            );

            cv.cvtColor(
                hsv,
                hsv,
                cv.COLOR_RGB2HSV
            );

            const detections =
                this.detectColor(
                    hsv,
                    color
                );

            console.log(
                `DEBUG ${color.toUpperCase()} :`,
                detections
            );

            return detections;

        } finally {

            hsv.delete();
        }
    }

    drawDetections(
        ctx,
        pucks
    ) {

        if (!ctx || !Array.isArray(pucks)) {
            return;
        }

        ctx.save();

        for (const puck of pucks) {

            const x =
                puck.center.x;

            const y =
                puck.center.y;

            const radius =
                puck.radius;


            /*
             * Cercle du palet
             */

            ctx.beginPath();

            ctx.arc(
                x,
                y,
                radius,
                0,
                Math.PI * 2
            );


            ctx.lineWidth = 3;

            ctx.strokeStyle =
                puck.color === "green" ?
                "#00ff00" :
                "#0000ff";

            ctx.stroke();


            /*
             * Centre du palet
             */

            ctx.beginPath();

            ctx.arc(
                x,
                y,
                5,
                0,
                Math.PI * 2
            );

            ctx.fillStyle =
                "#00ff00";

            ctx.fill();


            /*
             * Ligne centrale
             */

            ctx.beginPath();

            ctx.moveTo(
                x - 15,
                y
            );

            ctx.lineTo(
                x + 15,
                y
            );

            ctx.moveTo(
                x,
                y - 15
            );

            ctx.lineTo(
                x,
                y + 15
            );

            ctx.strokeStyle =
                "#00ff00";

            ctx.lineWidth = 2;

            ctx.stroke();


            /*
             * Informations
             */

            ctx.font =
                "16px Arial";

            ctx.fillStyle =
                "#ffffff";

            ctx.fillText(
                `${puck.color} ${(puck.confidence * 100).toFixed(0)}%`,
                x + radius + 10,
                y
            );
        }

        ctx.restore();
    }
}


window.PuckDetector =
    PuckDetector;