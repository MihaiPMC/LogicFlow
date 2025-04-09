import RunButton from "./RunButton"

const NavBar = () => {
  return (
    <div className="bg-gradient-to-r from-cyan-950 via-cyan-700 to-cyan-950 text-white p-4 flex justify-between items-center sticky top-0 z-10 shadow-md shadow-black">
        <h1 className="font-mono font-extrabold text-4xl mx-2">Ruleaza pseudocod!</h1>
        <RunButton />
    </div>
  )
}

export default NavBar