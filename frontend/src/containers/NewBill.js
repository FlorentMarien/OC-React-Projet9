import { ROUTES_PATH } from '../constants/routes.js'
import Logout from "./Logout.js"

export default class NewBill {
  constructor({ document, onNavigate, store, localStorage }) {
    this.document = document
    this.onNavigate = onNavigate
    this.store = store
    const formNewBill = this.document.querySelector(`form[data-testid="form-new-bill"]`)
    formNewBill.addEventListener("submit", this.handleSubmit)
    let file = this.document.querySelector(`input[data-testid="file"]`)
    file.addEventListener("change", this.handleChangeFile)
    this.fileUrl = null
    this.fileName = null
    this.billId = null
    this.succes = false
    new Logout({ document, localStorage, onNavigate })
  }
  handleChangeFile = e => {
    e.preventDefault()
    let typeok = ["image/jpg","image/jpeg","image/png"];
    if(this.document.querySelector(`input[data-testid="file"]`).files.length === 1){
      let file = this.document.querySelector(`input[data-testid="file"]`).files[0];
        if(!typeok.includes(file.type)){
          //alert("Mauvais format");
          this.fileUrl = null
          this.fileName = null
        }else{
          const filePath = this.document.querySelector(`input[data-testid="file"]`).files[0].name.split(/\\/g)
          const fileName = filePath[filePath.length-1]
          const formData = new FormData()
          const email = JSON.parse(localStorage.getItem("user")).email
          formData.append('file', file)
          formData.append('email', email)

          this.store
            .bills()
            .create({
              data: formData,
              headers: {
                noContentType: true
              }
            })
            .then(({fileUrl,  key}) => {
              this.billId = key
              this.fileUrl = fileUrl
              this.fileName = fileName
              
            }).catch(error => console.error(error))
        
        }
    }else{
      return Error
    }
  }

  handleSubmit = e => {
    e.preventDefault()
    if(this.fileUrl === null && this.fileName === null){
      //alert("Problème avec votre image");
      //Ajouter verif autre input
    }else{
      let user;
      user = JSON.parse(localStorage.getItem('user'))
      if (typeof user === 'string') {
        user = JSON.parse(user)
      }
      const email = user.email
      const bill = {
        email,
        type: e.target.querySelector(`select[data-testid="expense-type"]`).value,
        name:  e.target.querySelector(`input[data-testid="expense-name"]`).value,
        amount: parseInt(e.target.querySelector(`input[data-testid="amount"]`).value),
        date:  e.target.querySelector(`input[data-testid="datepicker"]`).value,
        vat: e.target.querySelector(`input[data-testid="vat"]`).value,
        pct: parseInt(e.target.querySelector(`input[data-testid="pct"]`).value) || 20,
        commentary: e.target.querySelector(`textarea[data-testid="commentary"]`).value,
        fileUrl: this.fileUrl,
        fileName: this.fileName,
        status: 'pending'
      }
      console.log(bill)
      this.succes = true
      this.updateBill(bill)
      this.onNavigate(ROUTES_PATH['Bills'])
    }
  }

  // not need to cover this function by tests
  updateBill = (bill) => {
    if (this.store) {
      this.store
      .bills()
      .update({data: JSON.stringify(bill), selector: this.billId})
      .then(() => {
        this.onNavigate(ROUTES_PATH['Bills'])
      })
      .catch(error => console.error(error))
    }
  }
}