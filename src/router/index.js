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
					name: 'dashboard',
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
					name: 'svcclosurep2p',
					component: SVCClosureP2P,
					meta: {
						requiresAuth: true,
						adminAuth: true,
						breadcrumb: [{
								name: 'Home',
								link: '/dashboard'
							},
							{
								name: 'COD day Closure'
							}
						]
					},
				},
				{
					path: 'srclosure',
					name: 'srclosure',
					component: srclosure,
					meta: {
						requiresAuth: true,
						adminAuth: true,
						breadcrumb: [{
								name: 'Home',
								link: '/srclosure'
							},
							{
								name: 'srclosure'
							}
						]
					},
				},
				{
					path: 'svcclosuresearch',
					name: 'svcclosuresearch',
					component: SVCClosureSearch,
					meta: {
						requiresAuth: true,
						adminAuth: true,
						breadcrumb: [{
								name: 'Home',
								link: '/dashboard'
							},
							{
								name: 'SVC Search'
							}
						]
					},
				},
        {
          path: 'CODRemitanceClose',
          name: 'CODRemitanceClose',
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
					name: 'mapbankhub',
					component: MapBankHub,
					meta: {
						requiresAuth: true,
						adminAuth: true,
						breadcrumb: [{
								name: 'Home',
								link: '/dashboard'
							},
							{
								name: 'Bank and Hub mapping'
							}
						]
					},
				},
				{
					path: 'bankfiletoclosebulkaccount',
					name: 'bankfiletoclosebulkaccount',
					component: BankFileToCloseBulkAccount,
					meta: {
						requiresAuth: true,
						adminAuth: true,
						breadcrumb: [{
								name: 'Home',
								link: '/dashboard'
							},
							{
								name: 'E-Payment MIS Upload'
							}
						]
					},
				},
				{
					path: 'financeclosure',
					name: 'financeclosure',
					component: FinanceClosure,
					meta: {
						requiresAuth: true,
						adminAuth: true,
						breadcrumb: [{
								name: 'Home',
								link: '/dashboard'
							},
							{
								name: 'Finance Closure'
							}
						]
					},
				},
				{
					path: 'csvreopenday',
					name: 'csvreopenday',
					component: CSVReOpenDay,
					meta: {
						requiresAuth: true,
						adminAuth: true,
						breadcrumb: [{
								name: 'Home',
								link: '/dashboard'
							},
							{
								name: 'SVC Re - Open Day'
							}
						]
					},
				},
				{
					path: 'svcdepositexceptions',
					name: 'svcdepositexceptions',
					component: SVCDepositExceptions,
					meta: {
						requiresAuth: true,
						adminAuth: true,
						breadcrumb: [{
								name: 'Home',
								link: '/dashboard'
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
								link: '/dashboard'
							},
							{
								name: 'Pagination'
							}
						]
					}

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
  if (isLoggedIn == null) {
    isLoggedIn = false;
  } else {
    isLoggedIn = true;
  }
  next();
  // if (to.matched.some(record => record.meta.requiresAuth) && !isLoggedIn) {
  //   next({
  //     path: "/login",
  //
  //   });
  // } else {
  //   //console.log(to.matched.some(record => record.meta.adminAuth));
  //   if (to.matched.some(record => record.meta.requiresAuth)) {
  //
  //     const permissionEncrypt = window.localStorage.getItem('permissiondata')
  //     const bytes = CryptoJS.AES.decrypt(permissionEncrypt.toString(), 'Key');
  //     const plaintext = bytes.toString(CryptoJS.enc.Utf8);
  //     const permissiondata = JSON.parse(plaintext);
  //
  //     function isBigEnough(findURL) {
  //       if(findURL.submenu.length>0){
  //         return findURL.submenu.some(isBigChildEnough);
  //       }
  //       return findURL.url == to.name;
  //     }
  //     function isBigChildEnough(findURL) {
  //       return findURL.url == to.name;
  //     }
  //     //console.log(permissiondata);
  //     const setroles = permissiondata.some(isBigEnough)
  //     if (setroles) {
  //       next();
  //     } else {
  //       next({
  //         path: "/dashboard",
  //       });
  //     }
  //   } else {
  //     next();
  //   }
  // }

});
export default router;
