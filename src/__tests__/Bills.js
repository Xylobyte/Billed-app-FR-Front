/**
 * @jest-environment jsdom
 */

import {fireEvent, screen, waitFor} from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import {bills} from "../fixtures/bills.js"
import {ROUTES_PATH} from "../constants/routes.js"
import {localStorageMock} from "../__mocks__/localStorage.js"
import router from "../app/Router.js"
import Bills from "../containers/Bills.js"

describe("Given I am connected as an employee", () => {
    describe("When I am on Bills Page", () => {
        beforeEach(() => {
            Object.defineProperty(window, 'localStorage', {value: localStorageMock})
            window.localStorage.setItem('user', JSON.stringify({
                type: 'Employee'
            }))
            const root = document.createElement("div")
            root.setAttribute("id", "root")
            document.body.append(root)
            router()
        })

        test("Then bill icon in vertical layout should be highlighted", async () => {
            window.onNavigate(ROUTES_PATH.Bills)
            const windowIcon = await waitFor(() => screen.getByTestId('icon-window'))
            expect(windowIcon.classList.contains('active-icon')).toBe(true)
        })

        test("Then bills should be ordered from earliest to latest", () => {
            document.body.innerHTML = BillsUI({data: bills})
            const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
            const antiChrono = (a, b) => ((a > b) ? 1 : -1)
            const datesSorted = [...dates].sort(antiChrono)
            expect(dates).toEqual(datesSorted)
        })

        test("Then clicking on 'New Bill' button should navigate to NewBill Page", async () => {
            window.onNavigate(ROUTES_PATH.Bills)
            const newBillButton = await waitFor(() => screen.getByTestId('btn-new-bill'))
            fireEvent.click(newBillButton)
            expect(screen.getByTestId('form-new-bill')).toBeTruthy()
        })

        test("Then clicking on the eye icon should open the modal with bill image", async () => {
            window.onNavigate(ROUTES_PATH.Bills)
            const eyesIcon = await waitFor(() => screen.getAllByTestId('icon-eye'))
            const eyeIcon = eyesIcon[0]
            $.fn.modal = jest.fn()
            fireEvent.click(eyeIcon)
            expect($.fn.modal).toHaveBeenCalled()
            expect(screen.getByText('Justificatif')).toBeTruthy()
        })

        test("Then getBills method should fetch bills from store", async () => {
            const mockStore = {
                bills: jest.fn(() => ({
                    list: jest.fn().mockResolvedValueOnce(bills)
                }))
            }
            const billsContainer = new Bills({
                document, onNavigate: jest.fn(), store: mockStore, localStorage: window.localStorage
            })
            const fetchedBills = await billsContainer.getBills()
            expect(mockStore.bills).toHaveBeenCalled()
            expect(fetchedBills.length).toBe(4)
        })
    })
})
