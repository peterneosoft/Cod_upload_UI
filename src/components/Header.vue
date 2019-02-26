<style>
  .menu_item{
    font-size: 15px;
    font-weight: 600;
    margin-bottom: 0px;
    display: inline-block;
    cursor: pointer;
    color: #fff;
  }
  .menu_options_sub{
    display: none;
    width: 100%;
    height: auto;
    position: absolute;
    top: 55px;
    background-image: linear-gradient(#fff,#D3D3D3);
    color:#000000;
  }
  .mlink a{
    text-decoration: none;
    color:#000000;
  }
  .mlink{
    padding-top: 4px;
    padding-bottom: 6px;
    border-bottom: 1px dotted #bdbdbd;
  }
  .active{
    color:#4b8cbb!important;
  }
  tr:hover{
    background-color: transparent;
  }
  .topheadv1{
    padding-bottom: 5px;
    cursor: pointer;
    font-size: 14px;
  }
  .menu_options_mn{
    height: 100%;
    vertical-align: middle;
    line-height: 3;
    margin-left: 45px;
  }
  .menu_data{
    text-align: left;
    height: 100%;
    border: 1px solid #bdbdbd;
    font-family: Roboto, Arial, sans-serif;
    color: #424242;
    font-size: 13px;
    font-weight: 500;
  }
.table {
  width: 100%;
  height:100%;
  max-width: 100%;
  margin-bottom: 1rem;
  background-color: transparent;
}
.table td{
  border: none;
}
.dropdown-toggle::after{
  border-top: 0.3em solid #fff;
}
.app-header.navbar .dropdown-menu{
  top: 42px;
}
.app-header.navbar .navbar-brand,.app-header.navbar{
  background-color: #FFFFFF;
}
.navbar-nav .nav-link.active,.navbar .navbar-nav .active.dropdown-toggle:hover,{
  color: #fff!important;
}
</style>
<template>
<header class="app-header navbar">
  <b-link class="navbar-brand" to="Dashboard"></b-link>
  <button class="navbar-toggler sidebar-toggler d-md-down-none" type="button" @click="sidebarToggle">&#9776;</button>
 <!--  <b-nav is-nav-bar class="d-md-down-none">
    <b-nav-item class="px-3">Dashboard</b-nav-item>
    <b-nav-item class="px-3">Users</b-nav-item>
    <b-nav-item class="px-3">Settings</b-nav-item>
  </b-nav> -->
  <b-nav is-nav-bar class="ml-auto" style="margin-right:1%;">
  <!--   <b-nav-item class="d-md-down-none">
      <i class="icon-bell"></i><span class="badge badge-pill badge-danger">5</span>
    </b-nav-item> -->
    <!-- <b-nav-item class="d-md-down-none">
      <i class="icon-list"></i>
    </b-nav-item> -->
 <!--    <b-nav-item class="d-md-down-none">
      <i class="icon-location-pin"></i>
    </b-nav-item> -->
    <b-nav-item-dropdown right>
      <template slot="button-content">
          <img src="static/img/avatars/default-img.png" class="img-avatar" alt="admin@bootstrapmaster.com">
          <span class="d-md-down-none" style="color: #000 !important">{{username}}</span>
        </template>
      <b-dropdown-item @click="editProfile()"><i class="fa fa-user"></i> Profile</b-dropdown-item>
      <b-dropdown-item @click="changepassword"><i class="fa fa-sign-out"></i> Change Password</b-dropdown-item>
      <b-dropdown-item @click="logout"><i class="fa fa-lock"></i> Logout</b-dropdown-item>
    </b-nav-item-dropdown>
  </b-nav>

</header>
</template>
<script>
import CryptoJS from 'crypto-js';

export default {
  name: 'header',
  data() {
    return {
      username: '',
      usertype: '',
      logindata: [],
      navItem:[]
    }
  },
  mounted() {
    var userdetailEncrypt = window.localStorage.getItem('userdetail')
    var bytes  = CryptoJS.AES.decrypt(userdetailEncrypt.toString(), 'Key');
    var plaintext = bytes.toString(CryptoJS.enc.Utf8);
    var userdetail =JSON.parse(plaintext);
    this.uasertype = userdetail[0].utype;
    //console.log(userdetail[0])
    this.username = userdetail[0].FirstName;

    var permissionEncrypt = window.localStorage.getItem('permissiondata')
    var bytes1  = CryptoJS.AES.decrypt(permissionEncrypt.toString(), 'Key');
    var plaintext1 = bytes1.toString(CryptoJS.enc.Utf8);
    this.navItem=JSON.parse(plaintext1);


    this.$nextTick(() => {
      $(document).ready(function(){
      $(".menu_options_mn").on("mouseover",function(){
        $(".menu_options_sub").slideDown("slow");
      });
      $(".menu_options_sub").on("mouseleave", function(){
        $(this).slideUp("slow");
      });
      $("a").click(function(){
   $("a.active").removeClass("active");
   $(this).addClass("active");
});
    });
      })
  },
  methods: {
    sidebarToggle(e) {
      e.preventDefault()
      document.body.classList.toggle('sidebar-hidden')
    },

    logout(e) {
      e.preventDefault()
      localStorage.removeItem('permissiondata')
      localStorage.removeItem('userdetail')
      localStorage.removeItem('userToken')
      localStorage.removeItem('isLoggedIn')
      this.$router.push('/login')
    },
     changepassword() {
        this.$router.push('/changepassword')
    },

    editProfile() {
      if (this.usertype == 'Merchant')
        this.$router.push('/merchantProfile')
      else if (this.usertype == 'Client')
        this.$router.push('/companyProfile')
      else
        this.$router.push('/')
    },
    sidebarMinimize(e) {
      e.preventDefault()
      document.body.classList.toggle('sidebar-minimized')
    },
    mobileSidebarToggle(e) {
      e.preventDefault()
      document.body.classList.toggle('sidebar-mobile-show')
    },
    asideToggle(e) {
      e.preventDefault()
      document.body.classList.toggle('aside-menu-hidden')
    },
    itemlink(){
       $(".menu_options_sub").slideUp("slow");
    }
  }
}
</script>
