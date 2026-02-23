const translations = {
  en: {
    // Home
    "home.welcome": "Hello, welcome back!",
    "home.playersOnline": "players online",
    "home.activeGames": "active games",
    "home.play": "Play",
    "home.rules": "Rules",
    "home.cards": "Cards",
    "home.settings": "Settings",
    "home.updates": "Updates",

    // Play
    "play.title": "Prepare Your Deck",
    "play.findOpponent": "Find Opponent",
    "play.searching": "Looking for opponent...",

    // Settings
    "settings.title": "Settings",
    "settings.language": "🌍 Language",

    // Arena — toasts
    "arena.gameEnded": "The game has already ended!",
    "arena.notYourTurn": "It's not your turn",
    "arena.cannotAttack": "This card cannot attack now",
    "arena.cannotAttackMainTree": "cannot attack the Main Tree. There are other enemies on the board",
    "arena.outOfRange": "The target is out of range of this card's attack",
    "arena.noTreeToAttack": "There is no tree to attack here",
    "arena.creepersOnMainTree": "Creepers must be placed on the opponent's Main Tree",
    "arena.creepersResistant": "Creepers are resistant to spells",
    "arena.notYourTile": "The tile doesn't belong to you",
    "arena.cannotPlaceOnMainTree": "You cannot place a card on the Main Tree",
    "arena.notEnoughPoints": "You don't have enough points to play this card",
    "arena.cardsStillAttack": "Some of your cards still have an attack to be performed",
    "arena.cannotAttackMainTreeGeneric": "Cannot attack the Main Tree. There are enemies on board",

    // Socket — toasts
    "socket.connected": "Connected to the server",
    "socket.disconnected": "Disconnected",
    "socket.error": "Error",
    "socket.opponentLeft": "Opponent left the game",
    "socket.youWonOpponentLeft": "You won! Opponent left",
    "socket.opponentFound": "Opponent found! The game begins now",
    "socket.youWon": "Fantastic, you won!",
    "socket.enemyWon": "Enemy has won...",
    "socket.enemyMadeMove": "Enemy made a move. Your turn!",
    "socket.enemyPassed": "Enemy has just passed",
    "socket.draw": "It's a draw! The game ended!",
    "socket.turnStarted": "Turn {turn} has just began",
    "socket.youWonByTime": "You won by time! Enemy couldn't decide in time!",
    "socket.youLostByTime": "You lost by time! You couldn't decide in time!",

    // Actions Log
    "log.title": "Actions Log",
    "log.you": "You",
    "log.enemy": "Enemy",
    "log.your": "Your",
    "log.enemys": "Enemy's",
    "log.newTurn": "New turn",
    "log.atRow": "at row",
    "log.column": "column",
    "log.by": "by",
    "log.healed": "healed",
    "log.played": "played",
    "log.died": "died",
    "log.tookDamage": "took damage",
    "log.placed": "placed",
    "log.doubledDamage": "doubled its damage",
    "log.increasedDamage": "increased its damage",
    "log.reactivated": "was reactivated",
    "log.spellTriggered": "triggered!",
    "log.spellFizzled": "fizzled (target died)",

    // Active Spells
    "spells.title": "Active Spells",
    "spells.targets": "Targets:",
    "spells.your": "Your",
    "spells.enemys": "Enemy's",
    "spells.nextTurn": "next turn",

    // CardSelection
    "cards.notValidChoice": "Not a valid choice!",
    "cards.currentDeck": "Current Deck",
    "cards.availableCards": "Available Cards",

    // Updates
    "updates.title": "Development Log",
    "updates.footer": "The forest grows deeper... more updates soon.",
  },

  pl: {
    // Home
    "home.welcome": "Witaj ponownie!",
    "home.playersOnline": "graczy online",
    "home.activeGames": "aktywne gry",
    "home.play": "Graj",
    "home.rules": "Zasady",
    "home.cards": "Karty",
    "home.settings": "Ustawienia",
    "home.updates": "Aktualizacje",

    // Play
    "play.title": "Przygotuj swoją talię",
    "play.findOpponent": "Znajdź przeciwnika",
    "play.searching": "Szukam przeciwnika...",

    // Settings
    "settings.title": "Ustawienia",
    "settings.language": "🌍 Język",

    // Arena — toasts
    "arena.gameEnded": "Gra się już zakończyła!",
    "arena.notYourTurn": "To nie twoja kolej",
    "arena.cannotAttack": "Ta karta nie może teraz atakować",
    "arena.cannotAttackMainTree": "nie może atakować Głównego Drzewa. Są inni wrogowie na planszy",
    "arena.outOfRange": "Cel jest poza zasięgiem ataku tej karty",
    "arena.noTreeToAttack": "Nie ma tu drzewa do zaatakowania",
    "arena.creepersOnMainTree": "Pnącza muszą być umieszczone na Głównym Drzewie przeciwnika",
    "arena.creepersResistant": "Pnącza są odporne na zaklęcia",
    "arena.notYourTile": "To pole nie należy do ciebie",
    "arena.cannotPlaceOnMainTree": "Nie możesz umieścić karty na Głównym Drzewie",
    "arena.notEnoughPoints": "Nie masz wystarczająco punktów, żeby zagrać tę kartę",
    "arena.cardsStillAttack": "Niektóre karty mogą jeszcze atakować",
    "arena.cannotAttackMainTreeGeneric": "Nie można atakować Głównego Drzewa. Są wrogowie na planszy",

    // Socket — toasts
    "socket.connected": "Połączono z serwerem",
    "socket.disconnected": "Rozłączono",
    "socket.error": "Błąd",
    "socket.opponentLeft": "Przeciwnik opuścił grę",
    "socket.youWonOpponentLeft": "Wygrałeś! Przeciwnik uciekł",
    "socket.opponentFound": "Znaleziono przeciwnika! Gra się rozpoczyna",
    "socket.youWon": "Fantastycznie, wygrałeś!",
    "socket.enemyWon": "Przeciwnik wygrał...",
    "socket.enemyMadeMove": "Przeciwnik wykonał ruch. Twoja kolej!",
    "socket.enemyPassed": "Przeciwnik spasował",
    "socket.draw": "Remis! Gra zakończona!",
    "socket.turnStarted": "Tura {turn} właśnie się rozpoczęła",
    "socket.youWonByTime": "Wygrałeś! Czas przeciwnika się skończył!",
    "socket.youLostByTime": "Przegrałeś! Twój czas się skończył!",

    // Actions Log
    "log.title": "Dziennik akcji",
    "log.you": "Ty",
    "log.enemy": "Przeciwnik",
    "log.your": "Twój/a",
    "log.enemys": "Wrogi/a",
    "log.newTurn": "Nowa tura",
    "log.atRow": "w rzędzie",
    "log.column": "kolumna",
    "log.by": "przez",
    "log.healed": "uleczony/a",
    "log.played": "zagrano",
    "log.died": "zginął/a",
    "log.tookDamage": "otrzymał/a obrażenia",
    "log.placed": "umieszczono",
    "log.doubledDamage": "podwoił/a obrażenia",
    "log.increasedDamage": "zwiększył/a obrażenia",
    "log.reactivated": "reaktywowano",
    "log.spellTriggered": "zaklęcie aktywowane!",
    "log.spellFizzled": "zaklęcie wygasło (cel zginął)",

    // Active Spells
    "spells.title": "Aktywne zaklęcia",
    "spells.targets": "Cele:",
    "spells.your": "Twój/a",
    "spells.enemys": "Wrogi/a",
    "spells.nextTurn": "następna tura",

    // CardSelection
    "cards.notValidChoice": "Nieprawidłowy wybór!",
    "cards.currentDeck": "Aktualna talia",
    "cards.availableCards": "Dostępne karty",

    // Updates
    "updates.title": "Dziennik zmian",
    "updates.footer": "Las rośnie... więcej aktualizacji wkrótce.",
  },
};

export default translations;
