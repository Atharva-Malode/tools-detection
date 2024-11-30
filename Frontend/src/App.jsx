import { BrowserRouter, Route, Routes } from "react-router-dom";
import  { Navbar } from "./components/header";
import Video from "./Pages/video/index"
import Footer from "./components/footer";
import Home from "./Pages/Home";

function App() {
  return (
    <BrowserRouter>
      
      <Navbar />
      <Routes>
        <Route exact path="/" element={<Home />} />
        <Route exact path = "/video" element={<Video/>}/>
        <Route exact path = "/home" element = {<Home/>} />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}

export default App;