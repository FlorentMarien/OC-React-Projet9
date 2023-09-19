/**
 * @jest-environment jsdom
 */
import {fireEvent, screen} from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import { ROUTES, ROUTES_PATH} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store"

jest.mock("../app/store", () => mockStore)
let typeok = ["image/png","image/jpg","image/jpeg"];

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    const html = NewBillUI()
    document.body.innerHTML = html
    const onNavigate = (pathname) => {
      document.body.innerHTML = ROUTES({ pathname })
    }
    Object.defineProperty(window, 'localStorage', { value: localStorageMock })
    window.localStorage.setItem('user', JSON.stringify({ type: 'Employee', email: 'AdresseMailEmployeeTest@test.test'}))
    let newbill = new NewBill({document:document.body,onNavigate:onNavigate,store:mockStore,localStorage:window.localStorage});
    let inputFile = document.body.querySelector(`input[data-testid="file"]`)

    test("Then if file type is ok", async () => {
      const file = new File(['test'], 'chucknorris.jpg', { type: 'image/jpg' })
      await fireEvent.change(inputFile, {target: { files: [file] }} );
      expect(typeok.includes(inputFile.files[0].type)).toBe(true);
    })
    test("Then if file type is not ok", async () => {
      const file = new File(['test'], 'chucknorris.jpzzzg', { type: 'image/jpzzzg' })
      await fireEvent.change(inputFile, {target: { files: [file] }} );
      expect(typeok.includes(inputFile.files[0].type)).not.toBe(true);
    })
    test("Then if multiple file blocked", async () => {
      const file = new File(['test'], 'chucknorris.jpg', { type: 'image/jpg' })
      await fireEvent.change(inputFile, {target: { files: [file,file] }} );
      expect(inputFile.files.length).not.toBe(1);
    })
    test("Then if jpeg img is ok", () => {
      let img = {name:"Photodevacance",type:"image/jpeg"};
      expect(typeok.includes(img.type)).toBe(true);
    })
    test("Then if png img is ok", () => {
      let img = {name:"Photodevacance",type:"image/png"};
      expect(typeok.includes(img.type)).toBe(true);
    })
    test("Then if type of img is not ok", () => {
      let img = {name:"Photodevacance",type:"image/bmp"};
      expect(typeok.includes(img.type)).not.toBe(true);
    })
    //Generation form
    let data = {
      expense_name : "TEST Vol Paris Londres",
      datepicker : "2000-01-01",
      amount : "1",
      vat : 70,
      pct : 20,
      commentary : "TEST"
    }
    screen.getByTestId("expense-name").value = data.expense_name;
    screen.getByTestId("datepicker").value = data.datepicker;
    screen.getByTestId("amount").value = data.amount;
    screen.getByTestId("vat").value = data.vat;
    screen.getByTestId("pct").value = data.pct;
    screen.getByTestId("commentary").value = data.commentary;

    test("Then send form with no picture", async () => {
            
      await fireEvent.change(inputFile, {target: { files: [] }} )
      await fireEvent.submit(screen.getByTestId("form-new-bill"));
      
      expect(newbill.succes).not.toBe(true);
    })
    test("Then send form", async () => {
      const file = new File(['test'], 'chucknorris.jpg', { type: 'image/jpg' })
      await fireEvent.change(inputFile, {target: { files: [file] }} )
      await fireEvent.submit(screen.getByTestId("form-new-bill"));
      
      expect(screen.getByTestId("btn-new-bill")).not.toBe(undefined);
    })
  })
})
