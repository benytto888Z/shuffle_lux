class LineCalibration {

    constructor(config = {}) {

        this.zoneColor =
            config.zoneColor ?? "#ffffff";

        this.faultColor =
            config.faultColor ?? "#000000";

        this.hangerColor =
            config.hangerColor ?? "#ffd700";


        /*
         * Tolérance de couleur.
         *
         * Plus la valeur est élevée,
         * plus la détection accepte des
         * variations de couleur.
         */

        this.zoneTolerance =
            config.zoneTolerance ?? 40;

        this.faultTolerance =
            config.faultTolerance ?? 40;

        this.hangerTolerance =
            config.hangerTolerance ?? 40;


        /*
         * Épaisseur logique des lignes.
         */

        this.zoneLineWidth =
            config.zoneLineWidth ?? 3;

        this.faultLineWidth =
            config.faultLineWidth ?? 3;

        this.hangerLineWidth =
            config.hangerLineWidth ?? 5;


        this.initialized = true;
    }


    /*
     * =====================================================
     * COULEURS
     * =====================================================
     */

    setZoneColor(color) {

        this.validateColor(color);

        this.zoneColor =
            color;
    }


    setFaultColor(color) {

        this.validateColor(color);

        this.faultColor =
            color;
    }


    setHangerColor(color) {

        this.validateColor(color);

        this.hangerColor =
            color;
    }


    /*
     * =====================================================
     * TOLÉRANCES
     * =====================================================
     */

    setZoneTolerance(value) {

        this.zoneTolerance =
            this.validateTolerance(value);
    }


    setFaultTolerance(value) {

        this.faultTolerance =
            this.validateTolerance(value);
    }


    setHangerTolerance(value) {

        this.hangerTolerance =
            this.validateTolerance(value);
    }


    /*
     * =====================================================
     * ÉPAISSEURS
     * =====================================================
     */

    setZoneLineWidth(value) {

        this.zoneLineWidth =
            this.validateWidth(value);
    }


    setFaultLineWidth(value) {

        this.faultLineWidth =
            this.validateWidth(value);
    }


    setHangerLineWidth(value) {

        this.hangerLineWidth =
            this.validateWidth(value);
    }


    /*
     * =====================================================
     * VALIDATION COULEUR
     * =====================================================
     */

    validateColor(color) {

        if (
            typeof color !== "string" ||
            !/^#[0-9a-fA-F]{6}$/.test(color)
        ) {

            throw new Error(
                `Couleur invalide : ${color}`
            );
        }

        return color;
    }


    /*
     * =====================================================
     * VALIDATION TOLÉRANCE
     * =====================================================
     */

    validateTolerance(value) {

        if (
            !Number.isFinite(value) ||
            value < 0 ||
            value > 255
        ) {

            throw new Error(
                "Tolérance invalide."
            );
        }

        return value;
    }


    /*
     * =====================================================
     * VALIDATION ÉPAISSEUR
     * =====================================================
     */

    validateWidth(value) {

        if (
            !Number.isFinite(value) ||
            value <= 0
        ) {

            throw new Error(
                "Épaisseur invalide."
            );
        }

        return value;
    }


    /*
     * =====================================================
     * RGB
     * =====================================================
     */

    hexToRgb(hex) {

        this.validateColor(hex);


        return {

            r:
                parseInt(
                    hex.substring(1, 3),
                    16
                ),

            g:
                parseInt(
                    hex.substring(3, 5),
                    16
                ),

            b:
                parseInt(
                    hex.substring(5, 7),
                    16
                )
        };
    }


    rgbToHex(
        r,
        g,
        b
    ) {

        const toHex =
            value =>
                Math.max(
                    0,
                    Math.min(
                        255,
                        Math.round(value)
                    )
                )
                .toString(16)
                .padStart(2, "0");


        return (
            "#" +
            toHex(r) +
            toHex(g) +
            toHex(b)
        );
    }


    /*
     * =====================================================
     * COMPARAISON DE COULEUR
     * =====================================================
     */

    colorDistance(
        rgbA,
        rgbB
    ) {

        const dr =
            rgbA.r - rgbB.r;

        const dg =
            rgbA.g - rgbB.g;

        const db =
            rgbA.b - rgbB.b;


        return Math.sqrt(
            dr * dr +
            dg * dg +
            db * db
        );
    }


    isColorMatch(
        rgb,
        targetHex,
        tolerance
    ) {

        const target =
            this.hexToRgb(
                targetHex
            );


        return (
            this.colorDistance(
                rgb,
                target
            ) <= tolerance
        );
    }


    /*
     * =====================================================
     * PARAMÈTRES COMPLETS
     * =====================================================
     */

    getConfig() {

        return {

            zoneColor:
                this.zoneColor,

            faultColor:
                this.faultColor,

            hangerColor:
                this.hangerColor,

            zoneTolerance:
                this.zoneTolerance,

            faultTolerance:
                this.faultTolerance,

            hangerTolerance:
                this.hangerTolerance,

            zoneLineWidth:
                this.zoneLineWidth,

            faultLineWidth:
                this.faultLineWidth,

            hangerLineWidth:
                this.hangerLineWidth
        };
    }


    /*
     * =====================================================
     * CHARGEMENT CONFIGURATION
     * =====================================================
     */

    loadConfig(config = {}) {

        if (
            config.zoneColor !== undefined
        ) {

            this.setZoneColor(
                config.zoneColor
            );
        }


        if (
            config.faultColor !== undefined
        ) {

            this.setFaultColor(
                config.faultColor
            );
        }


        if (
            config.hangerColor !== undefined
        ) {

            this.setHangerColor(
                config.hangerColor
            );
        }


        if (
            config.zoneTolerance !== undefined
        ) {

            this.setZoneTolerance(
                config.zoneTolerance
            );
        }


        if (
            config.faultTolerance !== undefined
        ) {

            this.setFaultTolerance(
                config.faultTolerance
            );
        }


        if (
            config.hangerTolerance !== undefined
        ) {

            this.setHangerTolerance(
                config.hangerTolerance
            );
        }


        if (
            config.zoneLineWidth !== undefined
        ) {

            this.setZoneLineWidth(
                config.zoneLineWidth
            );
        }


        if (
            config.faultLineWidth !== undefined
        ) {

            this.setFaultLineWidth(
                config.faultLineWidth
            );
        }


        if (
            config.hangerLineWidth !== undefined
        ) {

            this.setHangerLineWidth(
                config.hangerLineWidth
            );
        }
    }


    /*
     * =====================================================
     * STATUS
     * =====================================================
     */

    getStatus() {

        return {

            initialized:
                this.initialized,

            config:
                this.getConfig()
        };
    }
}


window.LineCalibration =
    LineCalibration;