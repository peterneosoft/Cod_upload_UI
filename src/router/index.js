import Vue from 'vue'
import Router from 'vue-router'

// Containers
import Full from '@/containers/Full'

// Views
import dashboard from '@/views/components/dashboard'
import srclosure from '@/views/components/srclosure'
import srclosuresearch from '@/views/components/srclosuresearch'
import CODRemitanceClose from '@/views/components/CODRemitanceClose'
import Charts from '@/views/Charts'
import Widgets from '@/views/Widgets'
import SVCClosureP2P from '@/views/components/svcclosurep2p'
import SVCClosureSearch from '@/views/components/svcclosuresearch'
import AddEditClientTAT from '@/views/components/AddEditClientTAT'
import CODRemittance from '@/views/components/CODRemittance'
import MapBankHub from '@/views/components/mapbankhub'
import BankFileToCloseBulkAccount from '@/views/components/bankfiletoclosebulkaccount'
import FinanceClosure from '@/views/components/financeclosure'
import CSVReOpenDay from '@/views/components/csvreopenday'
import SVCDepositExceptions from '@/views/components/svcdepositexceptions'
import HubWiseCODReport from '@/views/components/hubwisecodreport'
import MISP2PCODReport from '@/views/components/misp2preport'
// Views - Components
import Buttons from '@/views/components/Buttons'
import SocialButtons from '@/views/components/SocialButtons'
import Cards from '@/views/components/Cards'
import Forms from '@/views/components/Forms'
import Modals from '@/views/components/Modals'
import Switches from '@/views/components/Switches'
import Tables from '@/views/components/Tables'
import Pagination from '@/views/components/pagination'

// Views - Icons
import FontAwesome from '@/views/icons/FontAwesome'
import SimpleLineIcons from '@/views/icons/SimpleLineIcons'
import CryptoJS from 'crypto-js';

// Views - Pages
import Page404 from '@/views/pages/Page404'
import Page500 from '@/views/pages/Page500'
import Login from '@/views/components/login'

Vue.use(Router)
const router = new Router({
  mode: 'hash', // Demo is living in GitHub.io, so required!
  linkActiveClass: 'open active',
  scrollBehavior: () => ({
    y: 0
  }),
  routes: [{
      path: '/',
      redirect: '/dashboard',
      name: 'Home',
      component: Full,
      children: [{
          path: 'dashboard',
          name: 'Dashboard',
          component: dashboard,
          meta: {
            requiresAuth: true,
            adminAuth: true,
            breadcrumb: [{
                name: 'Home',
                link: '/dashboard'
              },
              {
                name: 'Dashboard'
              }
            ]
          },
        },
        {
          path: 'svcclosurep2p',
          name: 'SVC Closure P2P',
          component: SVCClosureP2P,
          meta: {
            requiresAuth: true,
            adminAuth: true,
            breadcrumb: [{
                name: 'Home',
                link: '/svcclosurep2p'
              },
              {
                name: 'COD day Closure'
              }
            ]
          },
        },
        {
          path: 'srclosure',
          name: 'SR Closure',
          component: srclosure,
          meta: {
            requiresAuth: true,
            adminAuth: true,
            breadcrumb: [{
                name: 'Home',
                link: '/srclosure'
              },
              {
                name: 'SR Closure'
              }
            ]
          },
        },
        {
          path: 'srclosuresearch',
          name: 'SR Closure Search',
          component: srclosuresearch,
          meta: {
            requiresAuth: true,
            adminAuth: true,
            breadcrumb: [{
                name: 'Home',
                link: '/srclosuresearch'
              },
              {
                name: 'SR Closure Search'
              }
            ]
          },
        },
        {
          path: 'hubwisecodreport',
          name: 'Hub Wise COD Report',
          component: HubWiseCODReport,
          meta: {
            requiresAuth: true,
            adminAuth: true,
            breadcrumb: [{
                name: 'hubwisecodreport',
                link: '/hubwisecodreport'
              },
              {
                name: 'hubwisecodreport'
              }
            ]
          },
        },
        {
          path: 'CODRemittance',
          name: 'COD Remittance',
          component: CODRemittance,
          meta: {
            requiresAuth: true,
            adminAuth: true,
            breadcrumb: [{
                name: 'Home',
                link: '/CODRemittance'
              },
              {
                name: 'CODRemittance'
              }
            ]
          },
        },
        {
          path: 'AddEditClientTAT',
          name: 'Add EditClient TAT',
          component: AddEditClientTAT,
          meta: {
            requiresAuth: true,
            adminAuth: true,
            breadcrumb: [{
                name: 'Home',
                link: '/AddEditClientTAT'
              },
              {
                name: 'AddEditClientTAT'
              }
            ]
          },
        },
        {
          path: 'svcclosuresearch',
          name: 'SVC Closure Search',
          component: SVCClosureSearch,
          meta: {
            requiresAuth: true,
            adminAuth: true,
            breadcrumb: [{
                name: 'Home',
                link: '/svcclosuresearch'
              },
              {
                name: 'SVC Search'
              }
            ]
          },
        },
        {
          path: 'CODRemitanceClose',
          name: 'COD Remittance Closed Details',
          component: CODRemitanceClose,
          meta: {
            requiresAuth: true,
            adminAuth: true,
            breadcrumb: [{
                name: 'Home',
                link: '/CODRemitanceClose'
              },
              {
                name: 'CODRemitanceClose'
              }
            ]
          },
        },
        {
          path: 'mapbankhub',
          name: 'Bank Hub Mapping',
          component: MapBankHub,
          meta: {
            requiresAuth: true,
            adminAuth: true,
            breadcrumb: [{
                name: 'Home',
                link: '/mapbankhub'
              },
              {
                name: 'Bank and Hub mapping'
              }
            ]
          },
        },
        {
          path: 'bankfiletoclosebulkaccount',
          name: 'Bulk Upload To Close',
          component: BankFileToCloseBulkAccount,
          meta: {
            requiresAuth: true,
            adminAuth: true,
            breadcrumb: [{
                name: 'Home',
                link: '/bankfiletoclosebulkaccount'
              },
              {
                name: 'E-Payment MIS Upload'
              }
            ]
          },
        },
        {
          path: 'financeclosure',
          name: 'Finance Closure',
          component: FinanceClosure,
          meta: {
            requiresAuth: true,
            adminAuth: true,
            breadcrumb: [{
                name: 'Home',
                link: '/financeclosure'
              },
              {
                name: 'Finance Closure'
              }
            ]
          },
        },
        {
          path: 'csvreopenday',
          name: 'Finance Re-Open Closure',
          component: CSVReOpenDay,
          meta: {
            requiresAuth: true,
            adminAuth: true,
            breadcrumb: [{
                name: 'Home',
                link: '/csvreopenday'
              },
              {
                name: 'SVC Re - Open Day'
              }
            ]
          },
        },
        {
          path: 'svcdepositexceptions',
          name: 'SVC Deposit Exceptions',
          component: SVCDepositExceptions,
          meta: {
            requiresAuth: true,
            adminAuth: true,
            breadcrumb: [{
                name: 'Home',
                link: '/svcdepositexceptions'
              },
              {
                name: 'SVC Bank Deposit Exceptions'
              }
            ]
          },
        },
        {
          path: 'pagination',
          name: 'Pagination',
          component: Pagination,
          meta: {
            requiresAuth: true,
            breadcrumb: [{
                name: 'Home',
                link: '/Pagination'
              },
              {
                name: 'Pagination'
              }
            ]
          }

        },
        {
          path: 'misp2preport',
          name: 'MIS P2P COD Report',
          component: MISP2PCODReport,
          meta: {
            requiresAuth: true,
            adminAuth: true,
            breadcrumb: [{
                name: 'Home',
                link: '/misp2preport'
              },
              {
                name: 'MIS P2P COD Report'
              }
            ]
          },
        },
        {
          path: 'charts',
          name: 'Charts',
          component: Charts
        },
        {
          path: 'widgets',
          name: 'Widgets',
          component: Widgets
        },

        {
          path: 'icons',
          redirect: '/icons/font-awesome',
          name: 'Icons',
          component: {
            render(c) {
              return c('router-view')
            }
          },
          children: [{
              path: 'font-awesome',
              name: 'Font Awesome',
              component: FontAwesome
            },
            {
              path: 'simple-line-icons',
              name: 'Simple Line Icons',
              component: SimpleLineIcons
            }
          ]
        }
      ]
    },

    {
      path: '/login',
      name: 'login',
      component: Login
    },

    {
      path: '/pages',
      redirect: '/pages/p404',
      name: 'Pages',
      component: {
        render(c) {
          return c('router-view')
        }
      },
      children: [{
          path: '404',
          name: 'Page404',
          component: Page404
        },
        {
          path: '500',
          name: 'Page500',
          component: Page500
        },
        {
          path: 'login',
          name: 'Login',
          component: Login
        }
      ]
    },

  ]
});

router.beforeEach((to, from, next) => {


  var isLoggedIn = window.localStorage.getItem('isLoggedIn');
  var accessuserToken = window.localStorage.getItem('accessuserToken');
  if (isLoggedIn == null) {
    isLoggedIn = false;
  } else {
    if(accessuserToken==null){
      localStorage.removeItem('accesshubdata')
      localStorage.removeItem('accesspermissiondata')
      localStorage.removeItem('accessuserdata')
      localStorage.removeItem('accessuserToken')
      localStorage.removeItem('isLoggedIn')
      isLoggedIn = false;
    }else{
      isLoggedIn = true;
    }

  }
  //next();
  if (to.matched.some(record => record.meta.requiresAuth) && !isLoggedIn) {
    next({
      path: "/login",

    });
  } else {

    if (to.matched.some(record => record.meta.requiresAuth)) {

      const permissionEncrypt = window.localStorage.getItem('accesspermissiondata')
      const bytes = CryptoJS.AES.decrypt(permissionEncrypt.toString(), 'Key');
      const plaintext = bytes.toString(CryptoJS.enc.Utf8);
      const permissiondata = JSON.parse(plaintext);
      //console.log("permissiondata",permissiondata);
      function isBigEnough(findURL) {
        if(findURL.children.length>0){
          return findURL.children.some(isBigChildEnough);
        }
        return findURL.name == to.name;
      }
      function isBigChildEnough(findURL) {
        return findURL.name == to.name;
      }
      //console.log(permissiondata);
      const setroles = permissiondata.some(isBigEnough)
      //console.log(setroles);
      if (setroles) {
        next();
      } else {
        next({
          path: "/dashboard",
        });
      }
    } else {
      next();
    }
  }

});
export default router;
