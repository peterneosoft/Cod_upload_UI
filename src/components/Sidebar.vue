<style type="text/css">
  .sidebar-fixed .main, .sidebar-fixed .app-footer{
    margin-left:0px;
  }
</style>
<template>
  <div class="sidebar">
    <nav class="sidebar-nav">
      <div slot="header"></div>
     <ul class="nav">

          <li class="nav-item">
            <template>
              <SidebarNavLink :name="'test'" :url="'test'" :icon="'test'"/>
            </template>
        </li>
      </ul>
      <ul class="nav">
        <li class="nav-item" v-for="(item, index) in navItem">

           <template v-if="item.submenu.length>0">
              <SidebarNavDropdown :name="item.mainmenu" :url="'../../'+item.url" :icon="item.purl">
                <template v-for="child in item.submenu">
                  <SidebarNavLink :name="child.childname"  :url="'../../'+child.url" :icon="child.purl"/>
                  <!-- <template v-else>
                    <li class="nav-item">
                      <SidebarNavLink :name="child.name" :url="'../../'+child.url" :icon="child.purl" :badge="child.badge"/>
                    </li>
                  </template> -->
                </template>
              </SidebarNavDropdown>
           </template>
            <template v-else>
            <SidebarNavLink :name="item.mainmenu" :icon="item.purl" :url="'../../'+item.url"/>
          </template>
         </li>
      </ul>
       <slot></slot>
      <div slot="footer"></div>
    </nav>
  </div>
</template>
<script>
import SidebarNavDropdown from './SidebarNavDropdown';
import SidebarNavLink from './SidebarNavLink';
import SidebarNavTitle from './SidebarNavTitle';
 import CryptoJS from 'crypto-js';
export default {
  name: 'sidebar',
  props: {

  },
  components: {
    SidebarNavDropdown,
    SidebarNavLink,
    SidebarNavTitle
  },

  data () {
    return {
       navItem:  []
     }
  },
  mounted(){
          var permissionEncrypt = window.localStorage.getItem('permissiondata')
          var bytes  = CryptoJS.AES.decrypt(permissionEncrypt.toString(), 'Key');
          var plaintext = bytes.toString(CryptoJS.enc.Utf8);
          this.navItem=JSON.parse(plaintext);

          //this.navItem=JSON.parse(window.localStorage.getItem('permissiondata'))
          //console.log(this.navItem)
          //this.leftjson = '[{"permission_name":"Dashboard","url":"home","role":"super admin","parentid":"1"},{"purl":"images/icons/5.png","permission_name":"Master Product List","url":"company","role":"super admin","parentid":"1"},{"purl":"images/icons/2.png","permission_name":"Merchant","url":"merchant","role":"super admin","parentid":"1"}]'
          //this.navItem = JSON.parse(this.leftjson)
          //,{"purl":"images/icons/1.png","permission_name":"Company","url":"company","role":"super admin","parentid":"1"}
      },

  methods: {
    handleClick (e) {
      e.preventDefault()
      e.target.parentElement.classList.toggle('open')
    }
  }
}
</script>

<style lang="css">
  .nav-link {
    cursor:pointer;
    background:#2f353a;
  }
  .sidebar{
    z-index:99;
    top:89px;
    background:#2f353a;
  }
  .app-header.navbar .navbar-toggler{
    color:#23282c;
  }

</style>
