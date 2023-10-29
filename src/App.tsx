import './App.scss'
import Header from './components/Header'
import ExpressionEditor from './components/ExpressionEditor'
import VariableGenerator from './components/VariableGenerator'

function App() {
  return (
    <>
      <div className="wrapper-home-screen">
      <Header />
      <div className=" flex-1 flex mx-auto flex-row pt-20  items-center ali md:container md:mx-auto  max-w-sm min-w-max ">
        <div className=" h-full flex-1 flex mx-auto flex-col   ali md:container md:mx-auto  max-w-sm min-w-max">
          <ExpressionEditor />
        </div>
        <div className=" h-full flex-1 flex mx-auto flex-col  items-center ali md:container md:mx-auto  max-w-sm min-w-max">
          <VariableGenerator />
        </div>
      </div>
    </div>
    </>
  )
}

export default App
