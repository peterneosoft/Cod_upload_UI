<template>
  <div class="sidebar">
    <nav class="sidebar-nav">
      <div slot="header"></div>
        <ul class="nav">
        <li class="nav-item" v-for="(item, index) in navItem">

           <template v-if="item.children.length>0">
              <SidebarNavDropdown :name="item.name" :url="item.url" :icon="item.name">
                <template v-for="child in item.children">
                  <SidebarNavLink :name="child.name"  :url="item.url" :icon="child.name"/>
                </template>
              </SidebarNavDropdown>
           </template>
            <template v-else>
            <SidebarNavLink :name="item.name" :icon="item.name" :url="+item.url"/>
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
          var permissionEncrypt = window.localStorage.getItem('accesspermissiondata')
          var bytes  = CryptoJS.AES.decrypt(permissionEncrypt.toString(), 'Key');
          var plaintext = bytes.toString(CryptoJS.enc.Utf8);
          this.navItem=JSON.parse(plaintext);
          console.log(plaintext);
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
    background:#2f353a;
  }
  .app-header.navbar .navbar-toggler{
    color:#23282c;
  }

</style>
