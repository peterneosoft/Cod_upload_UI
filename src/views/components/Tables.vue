<template>

  <div class="animated fadeIn">
    <button type="button"  @click="updatecompanymodal = true" class="btn btn-primary">Primary</button>
    <i  @click="updatecompanymodal = true" class="fa fa-edit text-success fa-lg mt-2 ml-3"></i>
     <div class="col-12">
        <b-card header="Company List"  @ok="getCompanyData">
          <table class="">
            <thead>
              <tr class="text-primary">
                <th>Company ID</th>
                <th>Company Name</th>
                <th>Company Address</th>
                <th>Company Person Email</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="data in listCompanyData " >
                <td scope="row" class="text-left"><strong>{{data.cid}}</strong></td>
                <td>{{data.cname}}</td>
                <td>{{data.caddress}}</td>
                <td>{{data.cpersonemail}}</td>
                <!-- <td class="text-center"  (click)="getAddressRowData(data, addressmodal)">
                  <a  data-placement="top" data-toggle="tooltip" title="Edit"><i class="fa fa-pencil fa-1x text-success "></i></a>
                </td> -->
                <td><i  @click="updatecompanymodal = true" class="fa fa-edit text-success fa-lg mt-2 ml-3"></i></td>
                </tr>
            </tbody>
          </table>
            <paginate
           :page-count="pagecount"
           :page-range="2"
           :margin-pages="2"
           :click-handler="getPaginationData"
           :prev-text="'Prev'"
           :next-text="'Next'"
           :container-class="'pagination'">
         </paginate>
        </b-card>
        </div>
    <div class="row">
      <div class="col-lg-6">
        <b-card header="<i class='fa fa-align-justify'></i> Simple Table">
          <table class="table">
            <thead>
              <tr>
                <th>Username</th>
                <th>Date registered</th>
                <th>Role</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Samppa Nori</td>
                <td>2012/01/01</td>
                <td>Member</td>
                <td>
                  <span class="badge badge-success">Active</span>
                </td>
              </tr>
              <tr>
                <td>Estavan Lykos</td>
                <td>2012/02/01</td>
                <td>Staff</td>
                <td>
                  <span class="badge badge-danger">Banned</span>
                </td>
              </tr>
              <tr>
                <td>Chetan Mohamed</td>
                <td>2012/02/01</td>
                <td>Admin</td>
                <td>
                  <span class="badge badge-secondary">Inactive</span>
                </td>
              </tr>
              <tr>
                <td>Derick Maximinus</td>
                <td>2012/03/01</td>
                <td>Member</td>
                <td>
                  <span class="badge badge-warning">Pending</span>
                </td>
              </tr>
              <tr>
                <td>Friderik Dávid</td>
                <td>2012/01/21</td>
                <td>Staff</td>
                <td>
                  <span class="badge badge-success">Active</span>
                </td>
              </tr>
            </tbody>
          </table>
          <ul class="pagination">
            <li class="page-item"><a class="page-link" href="#">Prev</a></li>
            <li class="page-item active">
              <a class="page-link" href="#">1</a>
            </li>
            <li class="page-item"><a class="page-link" href="#">2</a></li>
            <li class="page-item"><a class="page-link" href="#">3</a></li>
            <li class="page-item"><a class="page-link" href="#">4</a></li>
            <li class="page-item"><a class="page-link" href="#">Next</a></li>
          </ul>
        </b-card>
      </div><!--/.col-->

      <div class="col-lg-6">
        <b-card header="<i class='fa fa-align-justify'></i> Striped Table">
          <table class="table table-striped">
            <thead>
              <tr>
                <th>Username</th>
                <th>Date registered</th>
                <th>Role</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Yiorgos Avraamu</td>
                <td>2012/01/01</td>
                <td>Member</td>
                <td>
                  <span class="badge badge-success">Active</span>
                </td>
              </tr>
              <tr>
                <td>Avram Tarasios</td>
                <td>2012/02/01</td>
                <td>Staff</td>
                <td>
                  <span class="badge badge-danger">Banned</span>
                </td>
              </tr>
              <tr>
                <td>Quintin Ed</td>
                <td>2012/02/01</td>
                <td>Admin</td>
                <td>
                  <span class="badge badge-secondary">Inactive</span>
                </td>
              </tr>
              <tr>
                <td>Enéas Kwadwo</td>
                <td>2012/03/01</td>
                <td>Member</td>
                <td>
                  <span class="badge badge-warning">Pending</span>
                </td>
              </tr>
              <tr>
                <td>Agapetus Tadeáš</td>
                <td>2012/01/21</td>
                <td>Staff</td>
                <td>
                  <span class="badge badge-success">Active</span>
                </td>
              </tr>
            </tbody>
          </table>
          <ul class="pagination">
            <li class="page-item"><a class="page-link" href="#">Prev</a></li>
            <li class="page-item active">
              <a class="page-link" href="#">1</a>
            </li>
            <li class="page-item"><a class="page-link" href="#">2</a></li>
            <li class="page-item"><a class="page-link" href="#">3</a></li>
            <li class="page-item"><a class="page-link" href="#">4</a></li>
            <li class="page-item"><a class="page-link" href="#">Next</a></li>
          </ul>
        </b-card>
      </div><!--/.col-->
    </div><!--/.row-->

    <div class="row">

      <div class="col-lg-6">
        <b-card header="<i class='fa fa-align-justify'></i> Condensed Table">
          <table class="table table-sm">
            <thead>
              <tr>
                <th>Username</th>
                <th>Date registered</th>
                <th>Role</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Carwyn Fachtna</td>
                <td>2012/01/01</td>
                <td>Member</td>
                <td>
                  <span class="badge badge-success">Active</span>
                </td>
              </tr>
              <tr>
                <td>Nehemiah Tatius</td>
                <td>2012/02/01</td>
                <td>Staff</td>
                <td>
                  <span class="badge badge-danger">Banned</span>
                </td>
              </tr>
              <tr>
                <td>Ebbe Gemariah</td>
                <td>2012/02/01</td>
                <td>Admin</td>
                <td>
                  <span class="badge badge-secondary">Inactive</span>
                </td>
              </tr>
              <tr>
                <td>Eustorgios Amulius</td>
                <td>2012/03/01</td>
                <td>Member</td>
                <td>
                  <span class="badge badge-warning">Pending</span>
                </td>
              </tr>
              <tr>
                <td>Leopold Gáspár</td>
                <td>2012/01/21</td>
                <td>Staff</td>
                <td>
                  <span class="badge badge-success">Active</span>
                </td>
              </tr>
            </tbody>
          </table>
          <ul class="pagination">
            <li class="page-item"><a class="page-link" href="#">Prev</a></li>
            <li class="page-item active">
              <a class="page-link" href="#">1</a>
            </li>
            <li class="page-item"><a class="page-link" href="#">2</a></li>
            <li class="page-item"><a class="page-link" href="#">3</a></li>
            <li class="page-item"><a class="page-link" href="#">4</a></li>
            <li class="page-item"><a class="page-link" href="#">Next</a></li>
          </ul>
        </b-card>
      </div><!--/.col-->

      <div class="col-lg-6">
        <b-card header="<i class='fa fa-align-justify'></i> Bordered Table">
          <table class="table table-bordered">
            <thead>
              <tr>
                <th>Username</th>
                <th>Date registered</th>
                <th>Role</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Pompeius René</td>
                <td>2012/01/01</td>
                <td>Member</td>
                <td>
                  <span class="badge badge-success">Active</span>
                </td>
              </tr>
              <tr>
                <td>Paĉjo Jadon</td>
                <td>2012/02/01</td>
                <td>Staff</td>
                <td>
                  <span class="badge badge-danger">Banned</span>
                </td>
              </tr>
              <tr>
                <td>Micheal Mercurius</td>
                <td>2012/02/01</td>
                <td>Admin</td>
                <td>
                  <span class="badge badge-secondary">Inactive</span>
                </td>
              </tr>
              <tr>
                <td>Ganesha Dubhghall</td>
                <td>2012/03/01</td>
                <td>Member</td>
                <td>
                  <span class="badge badge-warning">Pending</span>
                </td>
              </tr>
              <tr>
                <td>Hiroto Šimun</td>
                <td>2012/01/21</td>
                <td>Staff</td>
                <td>
                  <span class="badge badge-success">Active</span>
                </td>
              </tr>
            </tbody>
          </table>
          <ul class="pagination">
            <li class="page-item"><a class="page-link" href="#">Prev</a></li>
            <li class="page-item active">
              <a class="page-link" href="#">1</a>
            </li>
            <li class="page-item"><a class="page-link" href="#">2</a></li>
            <li class="page-item"><a class="page-link" href="#">3</a></li>
            <li class="page-item"><a class="page-link" href="#">4</a></li>
            <li class="page-item"><a class="page-link" href="#">Next</a></li>
          </ul>
        </b-card>

      </div><!--/.col-->
    </div><!--/.row-->

    <div class="row">
      <div class="col-12">
        <b-card header="<i class='fa fa-align-justify'></i> Combined All Table">
          <table class="table table-bordered table-striped table-sm">
            <thead>
              <tr>
                <th>Username</th>
                <th>Date registered</th>
                <th>Role</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Vishnu Serghei</td>
                <td>2012/01/01</td>
                <td>Member</td>
                <td>
                  <span class="badge badge-success">Active</span>
                </td>
              </tr>
              <tr>
                <td>Zbyněk Phoibos</td>
                <td>2012/02/01</td>
                <td>Staff</td>
                <td>
                  <span class="badge badge-danger">Banned</span>
                </td>
              </tr>
              <tr>
                <td>Einar Randall</td>
                <td>2012/02/01</td>
                <td>Admin</td>
                <td>
                  <span class="badge badge-secondary">Inactive</span>
                </td>
              </tr>
              <tr>
                <td>Félix Troels</td>
                <td>2012/03/01</td>
                <td>Member</td>
                <td>
                  <span class="badge badge-warning">Pending</span>
                </td>
              </tr>
              <tr>
                <td>Aulus Agmundr</td>
                <td>2012/01/21</td>
                <td>Staff</td>
                <td>
                  <span class="badge badge-success">Active</span>
                </td>
              </tr>
            </tbody>
          </table>
          <nav>
            <ul class="pagination">
              <li class="page-item"><a class="page-link" href="#">Prev</a></li>
              <li class="page-item active">
                <a class="page-link" href="#">1</a>
              </li>
              <li class="page-item"><a class="page-link" href="#">2</a></li>
              <li class="page-item"><a class="page-link" href="#">3</a></li>
              <li class="page-item"><a class="page-link" href="#">4</a></li>
              <li class="page-item"><a class="page-link" href="#">Next</a></li>
            </ul>
          </nav>
        </b-card>
      </div><!--/.col-->
    </div><!--/.row-->

    <b-modal class="modalheader" title="Update Company Details" size="400" v-model="updatecompanymodal" @ok="updatecompanymodal = false">
          <b-form-fieldset label="Company">
            <b-form-input type="text" id="company" placeholder="Enter your company name"></b-form-input>
          </b-form-fieldset>
          <b-form-fieldset label="VAT">
            <b-form-input type="text" id="vat" placeholder="PL1234567890"></b-form-input>
          </b-form-fieldset>
          <b-form-fieldset label="Street">
            <b-form-input type="text" id="street" placeholder="Enter street name"></b-form-input>
          </b-form-fieldset>
          <div class="row">
            <div class="col-sm-8">
              <b-form-fieldset label="City">
                <b-form-input type="text" id="city" placeholder="Enter your city"></b-form-input>
              </b-form-fieldset>
            </div>
            <div class="col-sm-4">
              <b-form-fieldset label="Postal Code">
                <b-form-input type="text" id="postal-code" placeholder="Postal Code"></b-form-input>
              </b-form-fieldset>
            </div>
          </div>
          <b-form-fieldset label="Country">
            <b-form-input type="text" id="country" placeholder="Country name"></b-form-input>
          </b-form-fieldset>
    </b-modal>
  </div>

</template>

<script>
import apiUrl from '../../constants'
import axios from 'axios'
import Paginate from 'vuejs-paginate'

export default {
  name: 'tables',
  components: {Paginate},
  data: function () {
    return {
      updatecompanymodal: false,
      listCompanyData: [],
      pageno: 0,
      pagecount: 0
    }
  },
  mounted () {
    this.pageno = 0
    this.getCompanyData()
  },
  methods: {
    getCompanyData () {
      console.log(apiUrl.api_url + 'companydata')
      this.input = ({
        offset: this.pageno,
        city: '',
        state: '',
        limit: 5
      })
      axios({ method: 'POST', 'url': apiUrl.api_url + 'companydata', 'data': this.input, 'headers': { 'content-type': 'application/x-www-form-urlencoded' } })
        // .then((response) => {
        //   this.addresstabledata = response.data['rows']
        // })
        // .catch((httpException) => {
        //   console.error('exception is:::::::::', httpException)
        // })
        .then(result => {
          this.listCompanyData = result.data.companyList
          let totalRows = result.data.tcount
          if (totalRows < 5) {
            this.pagecount = 1
          } else {
            this.pagecount = Math.ceil(totalRows / 5)
          }
          console.error(this.listCompanyData)
        }, error => {
          console.error(error)
        })
    },
    getPaginationData (pageNum) {
      this.pageno = (pageNum - 1) * 5
      this.getCompanyData()
    }
  }
}
</script>
