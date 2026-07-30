import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import About from "./About";

describe("about", () => {

    it("about render correctly", ()=>{
         render(<About/>);
         const linkElement = screen.getByText(/We bring game to you/);
         expect(linkElement).toBeInTheDocument();
    })
   
});
