interface GameStats {
  gameType: string;
  score: number;
  moves: number;
  timeElapsed: number;
  playerName: string;
  timestamp: number;
}

interface PlayerStats {
  totalGames: number;
  totalScore: number;
  averageScore: number;
  bestScore: number;
  gameHistory: GameStats[];
}

class GameStatsService {
  private stats: Map<string, PlayerStats> = new Map();

  // Record a completed game
  recordGame(playerName: string, gameType: string, score: number, moves: number, timeElapsed: number) {
    const gameStats: GameStats = {
      gameType,
      score,
      moves,
      timeElapsed,
      playerName,
      timestamp: Date.now()
    };

    // Get or create player stats
    let playerStats = this.stats.get(playerName);
    if (!playerStats) {
      playerStats = {
        totalGames: 0,
        totalScore: 0,
        averageScore: 0,
        bestScore: 0,
        gameHistory: []
      };
    }

    // Update player stats
    playerStats.totalGames += 1;
    playerStats.totalScore += score;
    playerStats.averageScore = Math.round(playerStats.totalScore / playerStats.totalGames);
    playerStats.bestScore = Math.max(playerStats.bestScore, score);
    playerStats.gameHistory.push(gameStats);

    // Store updated stats
    this.stats.set(playerName, playerStats);

    console.log(`Game recorded for ${playerName}:`, gameStats);
    console.log(`Updated stats:`, playerStats);

    return gameStats;
  }

  // Get stats for a player
  getPlayerStats(playerName: string): PlayerStats | null {
    return this.stats.get(playerName) || null;
  }

  // Get all players' stats
  getAllStats(): Map<string, PlayerStats> {
    return this.stats;
  }

  // Get leaderboard (top scores)
  getLeaderboard(gameType?: string): Array<{playerName: string, score: number, gameType: string}> {
    const allScores: Array<{playerName: string, score: number, gameType: string}> = [];
    
    this.stats.forEach((playerStats, playerName) => {
      playerStats.gameHistory.forEach(game => {
        if (!gameType || game.gameType === gameType) {
          allScores.push({
            playerName,
            score: game.score,
            gameType: game.gameType
          });
        }
      });
    });

    return allScores.sort((a, b) => b.score - a.score).slice(0, 10);
  }

  // Generate bingo achievements based on stats
  generateBingoAchievements(playerName: string): string[] {
    const playerStats = this.getPlayerStats(playerName);
    if (!playerStats) return [];

    const achievements: string[] = [];

    // Score-based achievements
    if (playerStats.bestScore >= 900) achievements.push('Memory Master (900+ score)');
    if (playerStats.bestScore >= 800) achievements.push('Sharp Mind (800+ score)');
    if (playerStats.averageScore >= 700) achievements.push('Consistent Player (700+ avg)');

    // Game count achievements
    if (playerStats.totalGames >= 5) achievements.push('Dedicated Gamer (5+ games)');
    if (playerStats.totalGames >= 10) achievements.push('Game Enthusiast (10+ games)');

    // Performance achievements
    const memoryGames = playerStats.gameHistory.filter(g => g.gameType === 'memory');
    if (memoryGames.length > 0) {
      const bestMemoryGame = memoryGames.reduce((best, game) => 
        game.score > best.score ? game : best
      );
      
      if (bestMemoryGame.moves <= 20) achievements.push('Efficient Player (≤20 moves)');
      if (bestMemoryGame.moves <= 18) achievements.push('Perfect Memory (≤18 moves)');
      if (bestMemoryGame.timeElapsed <= 60) achievements.push('Speed Demon (<60s)');
    }

    return achievements;
  }

  // Clear all stats (for testing)
  clearStats() {
    this.stats.clear();
  }
}

const gameStatsService = new GameStatsService();
export default gameStatsService;