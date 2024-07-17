<template>
  <div class="sidebar">
    <nav class="sidebar-nav">
      <div slot="header"></div>
        <!--<ul class="nav">
         <li class="nav-item">
           <a class="nav-link" href="/#/dashboard">
             <i class="nav-icon icon-speedometer"></i> COD Dashboard
           </a>
         </li>
          <li class="nav-item">
            <template>
               <SidebarNavDropdown :name="'SR Closure'" :url="'srclosure'" :icon="'srclosure'">
                 <template>
                   <li class="nav-item">
                     <SidebarNavLink :name="'SR Closure'"  :url="'srclosure'" :icon="'srclosure'"/>
                   </li>
                   <li class="nav-item">
                     <SidebarNavLink :name="'SR Closure Search'"  :url="'srclosuresearch'" :icon="'srclosuresearch'"/>
                   </li>
                 </template>
               </SidebarNavDropdown>
            </template>
          </li>
         <li class="nav-item">
            <template>
               <SidebarNavDropdown :name="'SVC Closure'" :url="'svcclosure'" :icon="'svcclosure'">
                 <template>
                   <li class="nav-item">
                     <SidebarNavLink :name="'SVC Closure P2P'"  :url="'svcclosurep2p'" :icon="'svcclosurep2p'"/>
                   </li>
                   <li class="nav-item">
                     <SidebarNavLink :name="'SVC Closure Search'"  :url="'svcclosuresearch'" :icon="'svcclosuresearch'"/>
                   </li>
                 </template>
               </SidebarNavDropdown>
            </template>
          </li>
          <li class="nav-item">
             <template>
                <SidebarNavDropdown :name="'Finance Closure'" :url="'financeclosure'" :icon="'financeclosure'">
                  <template>
                    <li class="nav-item">
                      <SidebarNavLink :name="'Bank Hub Mapping'"  :url="'mapbankhub'" :icon="'mapbankhub'"/>
                    </li>
                    <li class="nav-item">
                      <SidebarNavLink :name="'Bulk Upload To Close'"  :url="'bankfiletoclosebulkaccount'" :icon="'bankfiletoclosebulkaccount'"/>
                    </li>
                    <li class="nav-item">
                      <SidebarNavLink :name="'Finance Closure'"  :url="'financeclosure'" :icon="'financeclosure'"/>
                    </li>
                    <li class="nav-item">
                      <SidebarNavLink :name="'Finance Re-Open Closure'"  :url="'csvreopenday'" :icon="'csvreopenday'"/>
                    </li>
                    <li class="nav-item">
                      <SidebarNavLink :name="'SVC Deposit Exceptions'"  :url="'svcdepositexceptions'" :icon="'svcdepositexceptions'"/>
                    </li>
                  </template>
                </SidebarNavDropdown>
             </template>
           </li>
           <li class="nav-item">
            <template>
               <SidebarNavDropdown :name="'COD Reports'" :url="'hubwisecodreport'" :icon="'hubwisecodreport'">
                 <template>
                   <li class="nav-item">
                     <SidebarNavLink :name="'Hub Wise COD Report'"  :url="'hubwisecodreport'" :icon="'hubwisecodreport'"/>
                   </li>
                   <li class="nav-item">
                     <SidebarNavLink :name="'MIS P2P COD Report'"  :url="'misp2preport'" :icon="'misp2preport'"/>
                   </li>
                 </template>
               </SidebarNavDropdown>
            </template>
          </li>
        </ul>-->

        <ul class="nav">
          <li class="nav-item" v-for="(item, index) in navItem">

            <template v-if="item.children.length>0">
              <SidebarNavDropdown :name="item.name" :url="item.url" :icon="item.icons">
                <template v-for="child in item.children">
                  <SidebarNavLink :name="child.name"  :url="child.url" :icon="child.icons"/>
                </template>
              </SidebarNavDropdown>
            </template>
            <template v-else>
              <SidebarNavLink :name="item.name" :icon="item.icons" :url="item.url"/>
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

          var newArr = [];
          for (var i = 0; i < this.navItem.length; i++) {
            if(this.navItem[i].ismenu===true){
              newArr[i] = {
                'children':[],
                'icons':this.navItem[i].icons,
                'id': this.navItem[i].id,
                'ismenu':this.navItem[i].ismenu,
                'name':this.navItem[i].name,
                'parentid':this.navItem[i].parentid,
                'sequence':this.navItem[i].sequence,
                'url':this.navItem[i].url
              };

              for (var j = 0; j < this.navItem[i].children.length; j++) {
                if(this.navItem[i].children[j].ismenu===true){
                  newArr[i].children.push(this.navItem[i].children[j]);
                }
              }
            }
          }
          this.navItem = newArr;
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
  }
  .sidebar{
    z-index:99;
    background:#2f353a;
  }
  .app-header.navbar .navbar-toggler{
    color:#23282c;
  }

</style>
