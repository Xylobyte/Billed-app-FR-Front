/**
 * @jest-environment jsdom
 */

import {localStorageMock} from "../__mocks__/localStorage.js";
import router from "../app/Router.js";
import {fireEvent, screen, waitFor} from "@testing-library/dom";
import {ROUTES_PATH} from "../constants/routes.js";
import NewBill from "../containers/NewBill.js";
import mockStore from "../__mocks__/store.js"

describe("Given I am connected as an employee", () => {
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

    describe("When I am on NewBill Page", () => {
        test("Then the form should be rendered", async () => {
            window.onNavigate(ROUTES_PATH.NewBill)
            const form = await waitFor(() => screen.getByTestId("form-new-bill"));
            expect(form).toBeTruthy()
        })
    })

    describe("When I upload a file with a valid extension", () => {
        test("Then the file should be accepted", async () => {
            const fileInput = screen.getByTestId('file')
            const file = new File(['image'], 'image.png', { type: 'image/png' })

            const newBill = new NewBill({ document, onNavigate, store: mockStore, localStorage: window.localStorage })
            const handleChangeFile = jest.fn((e) => newBill.handleChangeFile(e))
            fileInput.addEventListener("change", handleChangeFile)
            fireEvent.change(fileInput, { target: { files: [file] } })

            expect(handleChangeFile).toHaveBeenCalled()
            expect(fileInput.files[0]).toEqual(file)
        })
    })

    describe("When I upload a file with an invalid extension", () => {
        test("Then the file should be rejected and an alert should be shown", () => {
            const fileInput = screen.getByTestId('file')
            const file = new File(['document'], 'document.pdf', { type: 'application/pdf' })

            const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {})
            const newBill = new NewBill({ document, onNavigate, store: mockStore, localStorage: window.localStorage })
            const handleChangeFile = jest.fn((e) => newBill.handleChangeFile(e))
            fileInput.addEventListener("change", handleChangeFile)
            fireEvent.change(fileInput, { target: { files: [file] } })

            expect(handleChangeFile).toHaveBeenCalled()
            expect(alertSpy).toHaveBeenCalledWith('Veuillez télécharger un fichier avec une extension jpg, jpeg ou png.')
            expect(fileInput.value).toBe('')

            alertSpy.mockRestore()
        })
    })

    describe("When I submit the form with valid data", () => {
        test("Then the bill should be created and navigated to Bills page", async () => {
            const form = screen.getByTestId('form-new-bill')

            const fNavigate = jest.fn()
            const newBill = new NewBill({ document, onNavigate: fNavigate, store: mockStore, localStorage: window.localStorage })

            const type = screen.getByTestId('expense-type')
            fireEvent.change(type, { target: { value: 'Transports' } })

            const name = screen.getByTestId('expense-name')
            fireEvent.change(name, { target: { value: 'Train ticket' } })

            const amount = screen.getByTestId('amount')
            fireEvent.change(amount, { target: { value: '100' } })

            const date = screen.getByTestId('datepicker')
            fireEvent.change(date, { target: { value: '2024-07-19' } })

            const vat = screen.getByTestId('vat')
            fireEvent.change(vat, { target: { value: '20' } })

            const pct = screen.getByTestId('pct')
            fireEvent.change(pct, { target: { value: '20' } })

            const commentary = screen.getByTestId('commentary')
            fireEvent.change(commentary, { target: { value: 'Business trip' } })

            const fileUrl = 'https://test.com/file.png'
            const fileName = 'file.png'
            newBill.fileUrl = fileUrl
            newBill.fileName = fileName

            const handleSubmit = jest.fn((e) => newBill.handleSubmit(e))
            form.addEventListener("submit", handleSubmit)
            fireEvent.submit(form)

            expect(handleSubmit).toHaveBeenCalled()
            expect(fNavigate).toHaveBeenCalledWith(ROUTES_PATH.Bills)
        })
    })
})
