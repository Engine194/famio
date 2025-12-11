import { Outlet } from "react-router-dom";
import Provisioning from "../Provisioning";
import Header from "./header";
import classes from './layout.module.css';
import Footer from "./footer";

const Layout = () => {
  return (
    <Provisioning>
      <Header />
      <div className={classes.container}>
        <main>
          <Outlet/>
        </main>
        <Footer/>
      </div>
    </Provisioning>
  );
};

export default Layout;
