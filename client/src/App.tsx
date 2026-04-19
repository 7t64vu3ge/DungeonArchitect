import { useAuth } from "./hooks/useAuth";
import { useSocket } from "./hooks/useSocket";
import LoginPage from "./pages/LoginPage";
import LobbyPage from "./pages/LobbyPage";
import GamePage from "./pages/GamePage";

export default function App() {
  const auth = useAuth();
  const socket = useSocket(auth.token);

  // Not logged in → show login
  if (!auth.token || !auth.user) {
    return (
      <LoginPage
        onLogin={auth.login}
        onRegister={auth.register}
        error={auth.error}
        loading={auth.loading}
      />
    );
  }

  // In a game → show game
  if (socket.gameState) {
    return (
      <GamePage
        gameState={socket.gameState}
        userId={auth.user.id}
        cardsCatalog={socket.cardsCatalog}
        onPlaceDefense={socket.placeDefense}
        onPlayerReady={socket.playerReady}
        onPlaceAttacker={socket.placeAttacker}
        onBackToLobby={() => window.location.reload()}
      />
    );
  }

  // Logged in, no game → show lobby
  return (
    <LobbyPage
      user={auth.user}
      inQueue={socket.inQueue}
      connected={socket.connected}
      onJoinQueue={socket.joinQueue}
      onLeaveQueue={socket.leaveQueue}
      onLogout={auth.logout}
    />
  );
}
