import * as cg from './core/board'

function App() {
  const board = cg.setDefaultLayout();
  cg.printBoard(board);
  return (
    <>
    </>
  )
}

export default App
