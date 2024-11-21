// Clase para hacer que los estilos de los componentes sean inmutables
export const cardStyles = Object.freeze({
  card: {
    // Eliminamos 'transition' y 'transform' para permitir animaciones
    // transition: 'none',
    // transform: 'none'
  },
  statsContainer: {
    display: 'flex',
    justifyContent: 'space-around',
    marginBottom: '1rem'
  },
  statItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  }
});
