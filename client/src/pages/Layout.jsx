import React from "react";
import { Nav, Navbar, Container } from "react-bootstrap";
import { Link, NavLink, Outlet } from "react-router-dom";
import logo from "../assets/logo.png";

function Layout() {
  return (
    <div>
      <Navbar bg="light" variant="light" id="navbar">
        <Container>
          <Link to={"/"}>
            <img src={logo} className="logo-navbar" />
          </Link>
          <Nav className="me-auto">
            <NavLink to={"/"} className="nav-link">
              Home
            </NavLink>
            <NavLink to={"/blocks"} className="nav-link">
              Blocks
            </NavLink>
            <NavLink to={"/conduct-transaction"} className="nav-link">
              Conduct Transaction
            </NavLink>
            <NavLink to={"/transaction-pool"} className="nav-link">
              Transaction Pool
            </NavLink>
          </Nav>
        </Container>
      </Navbar>
      <div className="Outlet">
        <Outlet />
      </div>
    </div>
  );
}

export default Layout;
