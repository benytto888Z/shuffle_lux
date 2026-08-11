class BoardGeometry {

    constructor(config = {}) {

        /*
         * =====================================================
         * DIMENSIONS PHYSIQUES
         * =====================================================
         */

        this.lengthM =
            config.lengthM ?? 1.20;

        this.widthM =
            config.widthM ?? 0.60;


        /*
         * =====================================================
         * DIMENSIONS DE L'IMAGE RECTIFIÉE
         * =====================================================
         */

        this.outputWidth =
            config.outputWidth ?? 1200;

        this.outputHeight =
            config.outputHeight ?? 600;


        /*
         * =====================================================
         * LIGNE DE FAUTE
         *
         * Position exprimée en ratio de la longueur.
         * Exemple :
         *
         * 0.20 = 20 % de la longueur
         * =====================================================
         */

        this.faultLineRatio =
            config.faultLineRatio ?? 0.20;


        /*
         * =====================================================
         * ZONES
         *
         * Chaque valeur représente la position
         * de la frontière sur l'axe X.
         *
         * IMPORTANT :
         * Ces valeurs sont configurables.
         * =====================================================
         */

        this.zoneRatios = {

            zone1:
                config.zoneRatios?.zone1 ?? 0.40,

            zone2:
                config.zoneRatios?.zone2 ?? 0.60,

            zone3:
                config.zoneRatios?.zone3 ?? 0.80,

            zone4:
                config.zoneRatios?.zone4 ?? 0.90
        };


        /*
         * =====================================================
         * HANGER
         * =====================================================
         */

        this.hangerRatio =
            config.hangerRatio ?? 0.95;


        /*
         * =====================================================
         * COULEURS DE CALIBRATION
         *
         * Elles pourront être modifiées depuis Flutter.
         * =====================================================
         */

        this.lineColors = {

            zone:
                config.lineColors?.zone ??
                "#ffffff",

            fault:
                config.lineColors?.fault ??
                "#000000",

            hanger:
                config.lineColors?.hanger ??
                "#ffd700"
        };


        /*
         * =====================================================
         * ÉPAISSEUR DES LIGNES
         * =====================================================
         */

        this.lineWidth =
            config.lineWidth ?? 3;


        this.faultLineWidth =
            config.faultLineWidth ?? 3;


        this.hangerLineWidth =
            config.hangerLineWidth ?? 5;


        this.initialized = true;
    }


    /*
     * =========================================================
     * DIMENSIONS
     * =========================================================
     */

    getDimensions() {

        return {

            lengthM:
                this.lengthM,

            widthM:
                this.widthM,

            outputWidth:
                this.outputWidth,

            outputHeight:
                this.outputHeight
        };
    }


    /*
     * =========================================================
     * CONVERSION RATIO → PIXELS
     * =========================================================
     */

    ratioToPixel(ratio) {

        return (
            ratio *
            this.outputWidth
        );
    }


    /*
     * =========================================================
     * PIXEL → RATIO
     * =========================================================
     */

    pixelToRatio(pixel) {

        return (
            pixel /
            this.outputWidth
        );
    }


    /*
     * =========================================================
     * LIGNE DE FAUTE
     * =========================================================
     */

    getFaultLineX() {

        return this.ratioToPixel(
            this.faultLineRatio
        );
    }


    /*
     * =========================================================
     * LIMITES DES ZONES
     * =========================================================
     */

    getZoneBoundaries() {

        return {

            zone1:
                this.ratioToPixel(
                    this.zoneRatios.zone1
                ),

            zone2:
                this.ratioToPixel(
                    this.zoneRatios.zone2
                ),

            zone3:
                this.ratioToPixel(
                    this.zoneRatios.zone3
                ),

            zone4:
                this.ratioToPixel(
                    this.zoneRatios.zone4
                )
        };
    }


    /*
     * =========================================================
     * LIMITE HANGER
     * =========================================================
     */

    getHangerBoundary() {

        return this.ratioToPixel(
            this.hangerRatio
        );
    }


    /*
     * =========================================================
     * RÉGLAGE DES ZONES
     * =========================================================
     */

    setZoneRatios(
        zone1,
        zone2,
        zone3,
        zone4
    ) {

        const values = [
            zone1,
            zone2,
            zone3,
            zone4
        ];


        if (
            values.some(
                value =>
                    !Number.isFinite(value)
            )
        ) {

            throw new Error(
                "Ratios de zones invalides."
            );
        }


        if (
            zone1 <= 0 ||
            zone2 <= zone1 ||
            zone3 <= zone2 ||
            zone4 <= zone3 ||
            zone4 >= 1
        ) {

            throw new Error(
                "Les limites des zones doivent être croissantes."
            );
        }


        this.zoneRatios = {

            zone1,

            zone2,

            zone3,

            zone4
        };
    }


    /*
     * =========================================================
     * RÉGLAGE HANGER
     * =========================================================
     */

    setHangerRatio(
        ratio
    ) {

        if (
            !Number.isFinite(ratio) ||
            ratio <= this.zoneRatios.zone4 ||
            ratio >= 1
        ) {

            throw new Error(
                "Position HANGER invalide."
            );
        }


        this.hangerRatio =
            ratio;
    }


    /*
     * =========================================================
     * RÉGLAGE LIGNE DE FAUTE
     * =========================================================
     */

    setFaultLineRatio(
        ratio
    ) {

        if (
            !Number.isFinite(ratio) ||
            ratio <= 0 ||
            ratio >= 1
        ) {

            throw new Error(
                "Position de ligne de faute invalide."
            );
        }


        this.faultLineRatio =
            ratio;
    }


    /*
     * =========================================================
     * COULEURS
     * =========================================================
     */

    setLineColors({
        zone,
        fault,
        hanger
    } = {}) {

        if (zone !== undefined) {

            this.lineColors.zone =
                zone;
        }


        if (fault !== undefined) {

            this.lineColors.fault =
                fault;
        }


        if (hanger !== undefined) {

            this.lineColors.hanger =
                hanger;
        }
    }


    /*
     * =========================================================
     * DESSIN DEBUG
     * =========================================================
     */

    drawDebug(ctx) {

        const width =
            this.outputWidth;

        const height =
            this.outputHeight;


        const zones =
            this.getZoneBoundaries();


        const fault =
            this.getFaultLineX();


        const hanger =
            this.getHangerBoundary();


        ctx.save();


        /*
         * Ligne de faute
         */

        ctx.lineWidth =
            this.faultLineWidth;

        ctx.strokeStyle =
            this.lineColors.fault;


        ctx.setLineDash([
            12,
            12
        ]);


        ctx.beginPath();

        ctx.moveTo(
            fault,
            0
        );

        ctx.lineTo(
            fault,
            height
        );

        ctx.stroke();


        ctx.setLineDash([]);


        /*
         * Lignes des zones
         */

        ctx.lineWidth =
            this.lineWidth;

        ctx.strokeStyle =
            this.lineColors.zone;


        const boundaries = [

            zones.zone1,
            zones.zone2,
            zones.zone3,
            zones.zone4

        ];


        for (
            const x of boundaries
        ) {

            ctx.beginPath();

            ctx.moveTo(
                x,
                0
            );

            ctx.lineTo(
                x,
                height
            );

            ctx.stroke();
        }


        /*
         * HANGER
         */

        ctx.lineWidth =
            this.hangerLineWidth;

        ctx.strokeStyle =
            this.lineColors.hanger;


        ctx.beginPath();

        ctx.moveTo(
            hanger,
            0
        );

        ctx.lineTo(
            hanger,
            height
        );

        ctx.stroke();


        /*
         * Cadre extérieur
         */

        ctx.lineWidth = 4;

        ctx.strokeStyle =
            "#00ff00";


        ctx.strokeRect(
            0,
            0,
            width,
            height
        );


        ctx.restore();
    }


    /*
     * =========================================================
     * STATUS
     * =========================================================
     */

    getStatus() {

        return {

            initialized:
                this.initialized,

            dimensions:
                this.getDimensions(),

            faultLineRatio:
                this.faultLineRatio,

            faultLineX:
                this.getFaultLineX(),

            zoneRatios:
                {
                    ...this.zoneRatios
                },

            zoneBoundaries:
                this.getZoneBoundaries(),

            hangerRatio:
                this.hangerRatio,

            hangerBoundary:
                this.getHangerBoundary(),

            lineColors:
                {
                    ...this.lineColors
                }
        };
    }
}


window.BoardGeometry =
    BoardGeometry;