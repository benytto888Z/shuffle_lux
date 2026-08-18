class ScoreEngine {

    constructor(config = {}) {

        this.allowedColors =
            config.allowedColors ?? [
                "blue",
                "green"
            ];

        this.maximumPucksPerColor =
            config.maximumPucksPerColor ?? 4;

        this.minimumScore =
            config.minimumScore ?? 0;

        this.maximumScore =
            config.maximumScore ?? 5;


        this.validateConfig();

        this.lastResult = null;

        this.initialized = true;
    }


    validateConfig() {

        if (
            !Array.isArray(this.allowedColors) ||
            this.allowedColors.length === 0
        ) {

            throw new Error(
                "ScoreEngine: allowedColors invalide."
            );
        }


        if (
            !Number.isInteger(
                this.maximumPucksPerColor
            ) ||
            this.maximumPucksPerColor <= 0
        ) {

            throw new Error(
                "ScoreEngine: maximumPucksPerColor invalide."
            );
        }


        if (
            !Number.isFinite(this.minimumScore) ||
            !Number.isFinite(this.maximumScore) ||
            this.minimumScore > this.maximumScore
        ) {

            throw new Error(
                "ScoreEngine: intervalle de scores invalide."
            );
        }
    }


    createColorSummary(color) {

        return {
            color,
            puckCount: 0,
            totalScore: 0,
            hangerCount: 0,

            results: {
                beforeFoulLine: 0,
                zone1: 0,
                zone2: 0,
                zone3: 0,
                zone4: 0,
                hanger: 0,
                outsideBoard: 0,
                unclassified: 0
            },

            pucks: []
        };
    }


    validatePuck(puck, index) {

        if (
            !puck ||
            typeof puck !== "object"
        ) {

            throw new Error(
                `ScoreEngine: palet #${index + 1} invalide.`
            );
        }


        if (
            !this.allowedColors.includes(
                puck.color
            )
        ) {

            throw new Error(
                `ScoreEngine: couleur inconnue pour le palet #${index + 1}.`
            );
        }


        if (
            !Number.isFinite(
                puck.finalScore
            ) ||
            puck.finalScore <
                this.minimumScore ||
            puck.finalScore >
                this.maximumScore
        ) {

            throw new Error(
                `ScoreEngine: score invalide pour le palet #${index + 1}.`
            );
        }


        if (
            !Number.isInteger(
                puck.finalScore
            )
        ) {

            throw new Error(
                `ScoreEngine: le score du palet #${index + 1} doit être entier.`
            );
        }


        return true;
    }


    normalizeResultKey(puck) {

        if (puck.isHanger) {
            return "hanger";
        }


        const key =
            puck.scoreType ??
            puck.boardZone ??
            "unclassified";


        const supported = [
            "beforeFoulLine",
            "zone1",
            "zone2",
            "zone3",
            "zone4",
            "outsideBoard",
            "unclassified"
        ];


        return supported.includes(key)
            ? key
            : "unclassified";
    }


    calculate(scoredPucks = []) {

        if (!Array.isArray(scoredPucks)) {

            throw new Error(
                "ScoreEngine: scoredPucks doit être un tableau."
            );
        }


        const byColor = {};


        for (
            const color of
            this.allowedColors
        ) {

            byColor[color] =
                this.createColorSummary(
                    color
                );
        }


        scoredPucks.forEach(
            (puck, index) => {

                this.validatePuck(
                    puck,
                    index
                );


                const summary =
                    byColor[puck.color];

                const resultKey =
                    this.normalizeResultKey(
                        puck
                    );


                summary.puckCount += 1;

                summary.totalScore +=
                    puck.finalScore;

                summary.results[resultKey] += 1;


                if (puck.isHanger) {
                    summary.hangerCount += 1;
                }


                summary.pucks.push({
                    ...puck,
                    scoringIndex:
                        index + 1
                });
            }
        );


        const colorCountsValid =
            this.allowedColors.every(
                color =>
                    byColor[color].puckCount <=
                    this.maximumPucksPerColor
            );


        const maximumTotalPucks =
            this.allowedColors.length *
            this.maximumPucksPerColor;


        const totalPucks =
            scoredPucks.length;

        const totalScore =
            this.allowedColors.reduce(
                (
                    total,
                    color
                ) =>
                    total +
                    byColor[color].totalScore,
                0
            );

        const totalHangers =
            this.allowedColors.reduce(
                (
                    total,
                    color
                ) =>
                    total +
                    byColor[color].hangerCount,
                0
            );


        const blueScore =
            byColor.blue?.totalScore ?? 0;

        const greenScore =
            byColor.green?.totalScore ?? 0;


        let provisionalLeader =
            "tie";


        if (blueScore > greenScore) {
            provisionalLeader = "blue";
        }

        if (greenScore > blueScore) {
            provisionalLeader = "green";
        }


        const result = {
            timestamp:
                Date.now(),

            valid:
                colorCountsValid &&
                totalPucks <=
                    maximumTotalPucks,

            totalPucks,

            maximumTotalPucks,

            totalScore,

            totalHangers,

            provisionalLeader,

            byColor,

            rules: {
                allValidPucksScore:
                    true,

                closestPuckOnly:
                    false,

                hangerPriority:
                    true,

                maximumPucksPerColor:
                    this.maximumPucksPerColor
            }
        };


        this.lastResult =
            result;


        return this.cloneResult(
            result
        );
    }


    cloneResult(result) {

        if (!result) {
            return null;
        }


        return JSON.parse(
            JSON.stringify(result)
        );
    }


    getLastResult() {

        return this.cloneResult(
            this.lastResult
        );
    }


    reset() {

        this.lastResult = null;
    }


    getStatus() {

        return {
            initialized:
                this.initialized,

            allowedColors:
                [...this.allowedColors],

            maximumPucksPerColor:
                this.maximumPucksPerColor,

            scoreRange: {
                minimum:
                    this.minimumScore,

                maximum:
                    this.maximumScore
            },

            hasLastResult:
                !!this.lastResult
        };
    }
}


if (
    typeof window !== "undefined"
) {

    window.ScoreEngine =
        ScoreEngine;
}


if (
    typeof module !== "undefined" &&
    module.exports
) {

    module.exports =
        ScoreEngine;
}
