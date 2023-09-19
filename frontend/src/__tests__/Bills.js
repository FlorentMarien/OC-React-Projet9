/**
 * @jest-environment jsdom
 */
import userEvent from '@testing-library/user-event'
import {fireEvent, getByTestId, screen, waitFor} from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import Bills from "../containers/Bills.js";
import { bills } from "../fixtures/bills.js"
import { ROUTES , ROUTES_PATH} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";
import localStoreMock from "../__mocks__/store.js";

import router from "../app/Router.js";

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      
      window.onNavigate(ROUTES_PATH.Bills)
      
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      //to-do write expect expression
      expect(windowIcon.classList[0]).toBe("active-icon");
    })
    test("Then open new bill", async () => {
      
      const store = null
      let test = new Bills({ document, onNavigate, store, localStorage:window.localStorage})
      test.handleClickNewBill();
      await waitFor(() => expect(screen.queryByTestId("form-new-bill")).not.toBe(null));
    })
    test("Then open modale picture of bill", async () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      document.body.innerHTML = BillsUI({ data: bills })
      const test = new Bills({
        document, onNavigate, store:null, localStorage: window.localStorage
      })
      
      const eye = screen.getAllByTestId('icon-eye')
      const handleClickIconEye = jest.fn(test.handleClickIconEye(eye[0]))
      eye[0].addEventListener('click', handleClickIconEye)
      userEvent.click(eye[0])
      expect(handleClickIconEye).toHaveBeenCalled()
    })
    test("Then get bill", async () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      document.body.innerHTML = BillsUI({ data: bills })
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      const test = new Bills({
        document, onNavigate, store:localStoreMock, localStorage: window.localStorage
      })
      let getbill = await test.getBills()
      expect(getbill).not.toBe(undefined)
    })
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a > b) ? -1 : 1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })
  })
})
