class GameRoundManager {

    constructor(config = {}) {

        this.gameDuration =
            config.gameDuration ?? 10000;

        this.stabilizationDuration =
            config.stabilizationDuration ?? 3000;


        this.onGameStart =
            config.onGameStart ?? null;

        this.onGameFinish =
            config.onGameFinish ?? null;

        this.onAnalysis =
            config.onAnalysis ?? null;

        this.onTick =
            config.onTick ?? null;

        this.onRoundComplete =
            config.onRoundComplete ?? null;

        this.onAnalysisError =
            config.onAnalysisError ?? null;


        this.timer = null;

        this.stabilizationTimer = null;


        this.phase = "idle";

        this.running = false;

        this.stabilizing = false;

        this.analyzing = false;

        this.remainingTime = 0;


        this.roundNumber = 0;

        this.startedAt = null;

        this.actionFinishedAt = null;

        this.completedAt = null;

        this.lastRoundResult = null;

        this.lastError = null;


        /*
         * Empêche un ancien callback asynchrone de terminer une manche après
         * un cancel/reset ou après le démarrage d'une nouvelle manche.
         */

        this.cycleToken = 0;


        this.validateConfig();

        this.initialized = true;
    }


    validateConfig() {

        if (
            !Number.isFinite(this.gameDuration) ||
            this.gameDuration <= 0
        ) {

            throw new Error(
                "GameRoundManager: gameDuration invalide."
            );
        }


        if (
            !Number.isFinite(
                this.stabilizationDuration
            ) ||
            this.stabilizationDuration < 0
        ) {

            throw new Error(
                "GameRoundManager: stabilizationDuration invalide."
            );
        }
    }


    isBusy() {

        return (
            this.running ||
            this.stabilizing ||
            this.analyzing
        );
    }


    start() {

        if (this.isBusy()) {

            console.warn(
                "GameRoundManager : manche déjà en cours."
            );

            return false;
        }


        this.clearTimers();

        this.cycleToken += 1;

        this.roundNumber += 1;

        this.phase = "running";

        this.running = true;

        this.stabilizing = false;

        this.analyzing = false;

        this.remainingTime =
            this.gameDuration;

        this.startedAt =
            Date.now();

        this.actionFinishedAt = null;

        this.completedAt = null;

        this.lastError = null;


        console.log(
            `🎮 MANCHE #${this.roundNumber} DÉMARRÉE`
        );


        this.emit(
            this.onGameStart,
            this.getStatus()
        );


        this.tick();


        this.timer =
            setInterval(
                () => {

                    this.remainingTime =
                        Math.max(
                            0,
                            this.remainingTime - 1000
                        );


                    this.tick();


                    if (
                        this.remainingTime <= 0
                    ) {

                        this.finish();
                    }

                },
                1000
            );


        return true;
    }


    tick() {

        this.emit(
            this.onTick,
            this.remainingTime,
            this.getStatus()
        );
    }


    finish() {

        if (!this.running) {
            return false;
        }


        if (this.timer) {

            clearInterval(
                this.timer
            );

            this.timer = null;
        }


        this.running = false;

        this.stabilizing = true;

        this.phase = "stabilizing";

        this.remainingTime = 0;

        this.actionFinishedAt =
            Date.now();


        console.log(
            `⏱️ MANCHE #${this.roundNumber} — TEMPS TERMINÉ`
        );

        console.log(
            `⏳ STABILISATION : ${this.stabilizationDuration / 1000} seconde(s)`
        );


        this.emit(
            this.onGameFinish,
            this.getStatus()
        );


        const token =
            this.cycleToken;


        this.stabilizationTimer =
            setTimeout(
                () => {

                    this.stabilizationTimer = null;


                    if (
                        token !==
                        this.cycleToken
                    ) {

                        return;
                    }


                    void this.analyze(token);

                },
                this.stabilizationDuration
            );


        return true;
    }


    async analyze(token = this.cycleToken) {

        if (
            this.analyzing ||
            token !== this.cycleToken
        ) {

            return null;
        }


        this.stabilizing = false;

        this.analyzing = true;

        this.phase = "analyzing";


        console.log(
            `📸 MANCHE #${this.roundNumber} — CAPTURE FINALE`
        );


        try {

            if (
                typeof this.onAnalysis !==
                "function"
            ) {

                throw new Error(
                    "GameRoundManager: callback onAnalysis absent."
                );
            }


            const finalBoardState =
                await Promise.resolve(
                    this.onAnalysis(
                        this.getStatus()
                    )
                );


            if (!finalBoardState) {

                throw new Error(
                    "GameRoundManager: analyse finale sans résultat."
                );
            }


            if (
                token !==
                this.cycleToken
            ) {

                return null;
            }


            const scoreResult =
                typeof finalBoardState
                    .getScoreResult === "function"
                    ? finalBoardState
                        .getScoreResult()
                    : (
                        finalBoardState
                            .scoreResult ??
                        null
                    );


            if (!scoreResult) {

                throw new Error(
                    "GameRoundManager: score final absent."
                );
            }


            this.completedAt =
                Date.now();

            this.phase = "completed";


            const roundResult = {
                roundNumber:
                    this.roundNumber,

                startedAt:
                    this.startedAt,

                actionFinishedAt:
                    this.actionFinishedAt,

                completedAt:
                    this.completedAt,

                actionDurationMs:
                    this.actionFinishedAt -
                    this.startedAt,

                stabilizationDurationMs:
                    this.stabilizationDuration,

                totalDurationMs:
                    this.completedAt -
                    this.startedAt,

                finalBoardState,

                scoreResult,

                summary: {
                    totalPucks:
                        scoreResult.totalPucks,

                    blueScore:
                        scoreResult
                            .byColor
                            .blue
                            .totalScore,

                    greenScore:
                        scoreResult
                            .byColor
                            .green
                            .totalScore,

                    totalHangers:
                        scoreResult.totalHangers,

                    provisionalLeader:
                        scoreResult
                            .provisionalLeader
                }
            };


            this.lastRoundResult =
                roundResult;


            console.log(
                `✅ MANCHE #${this.roundNumber} ANALYSÉE`,
                roundResult.summary
            );


            this.emit(
                this.onRoundComplete,
                roundResult,
                this.getStatus()
            );


            return roundResult;

        } catch (error) {

            if (
                token !==
                this.cycleToken
            ) {

                return null;
            }


            this.lastError = {
                message:
                    error?.message ??
                    String(error),

                timestamp:
                    Date.now(),

                roundNumber:
                    this.roundNumber
            };


            this.phase = "error";


            console.error(
                `❌ MANCHE #${this.roundNumber} — ERREUR D'ANALYSE`,
                error
            );


            this.emit(
                this.onAnalysisError,
                error,
                this.getStatus()
            );


            return null;

        } finally {

            if (
                token ===
                this.cycleToken
            ) {

                this.running = false;

                this.stabilizing = false;

                this.analyzing = false;
            }
        }
    }


    cancel() {

        this.cycleToken += 1;

        this.clearTimers();

        this.running = false;

        this.stabilizing = false;

        this.analyzing = false;

        this.remainingTime = 0;

        this.phase = "cancelled";


        console.log(
            `🛑 MANCHE #${this.roundNumber} ANNULÉE`
        );


        this.tick();


        return true;
    }


    reset() {

        this.cancel();

        this.roundNumber = 0;

        this.startedAt = null;

        this.actionFinishedAt = null;

        this.completedAt = null;

        this.lastRoundResult = null;

        this.lastError = null;

        this.phase = "idle";


        return this.getStatus();
    }


    clearTimers() {

        if (this.timer) {

            clearInterval(
                this.timer
            );

            this.timer = null;
        }


        if (this.stabilizationTimer) {

            clearTimeout(
                this.stabilizationTimer
            );

            this.stabilizationTimer = null;
        }
    }


    emit(callback, ...args) {

        if (
            typeof callback ===
            "function"
        ) {

            callback(...args);
        }
    }


    getLastRoundResult() {

        return this.lastRoundResult;
    }


    getStatus() {

        return {
            initialized:
                this.initialized,

            phase:
                this.phase,

            roundNumber:
                this.roundNumber,

            running:
                this.running,

            stabilizing:
                this.stabilizing,

            analyzing:
                this.analyzing,

            busy:
                this.isBusy(),

            remainingTime:
                this.remainingTime,

            gameDuration:
                this.gameDuration,

            stabilizationDuration:
                this.stabilizationDuration,

            startedAt:
                this.startedAt,

            actionFinishedAt:
                this.actionFinishedAt,

            completedAt:
                this.completedAt,

            hasLastRoundResult:
                !!this.lastRoundResult,

            lastRoundSummary:
                this.lastRoundResult
                    ?.summary ??
                null,

            lastError:
                this.lastError
                    ? { ...this.lastError }
                    : null
        };
    }
}


if (
    typeof window !== "undefined"
) {

    window.GameRoundManager =
        GameRoundManager;
}


if (
    typeof module !== "undefined" &&
    module.exports
) {

    module.exports =
        GameRoundManager;
}
