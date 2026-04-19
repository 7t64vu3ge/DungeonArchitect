import { useAuth } from "./hooks/useAuth";
import { useSocket } from "./hooks/useSocket";
import LoginPage from "./pages/LoginPage";
import LobbyPage from "./pages/LobbyPage";
import GamePage from "./pages/GamePage";

export default function App() {
  const auth = useAuth();
  const socket = useSocket(auth.token);


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


  if (socket.gameState) {
    return (
      <GamePage
        gameState={socket.gameState}
        userId={auth.user.id}
        cardsCatalog={socket.cardsCatalog}
        onPlaceDefense={socket.placeDefense}
        onPlaceCastle={socket.placeCastle}
        onPlayerReady={socket.playerReady}
        onPlaceAttacker={socket.placeAttacker}
        onRefreshProfile={auth.refreshProfile}
        onBackToLobby={() => window.location.reload()}
      />
    );
  }


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
