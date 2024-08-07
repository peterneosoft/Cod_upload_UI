import Vue from 'vue'
import Router from 'vue-router'
import axios from 'axios';
import apiUrl from '../constants';

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
import AutoRemittance from '@/views/components/AutoRemittance'
import ManualRemittance from '@/views/components/ManualRemittance'
import MapBankHub from '@/views/components/mapbankhub'
import BankFileToCloseBulkAccount from '@/views/components/bankfiletoclosebulkaccount'
import FinanceClosure from '@/views/components/financeclosure'
import CSVReOpenDay from '@/views/components/csvreopenday'
import SVCDepositExceptions from '@/views/components/svcdepositexceptions'
import HubWiseCODReport from '@/views/components/hubwisecodreport'
import CODOutstandingReport from '@/views/components/codoutstandingreport'
import PaymentReport from '@/views/components/paymentreport'
import MISP2PCODReport from '@/views/components/misp2preport'
import SystemSettings from '@/views/components/settings'
import BankHoliday from '@/views/components/bankholiday'
import EMailRemittance from '@/views/components/emailremittance'
import Invoice from '@/views/components/invoice'
import InvoiceReport from '@/views/components/invoicereport'
import DeliveredToInScan from '@/views/components/changeshipmentstatus'
import PaymentMode from '@/views/components/paymentmode'
import SRSummary from '@/views/components/srsummary'
import AWBDifference from '@/views/components/awbdifference'
import SRPendingLimit from '@/views/components/srpendinglimit'
import HubWiseTracking from '@/views/components/hubwisetracking'
import DisputeReport from '@/views/components/disputereport'
import OrderType from '@/views/components/ordertype'
import LongTailClient from '@/views/components/longtailclient'
import EPaymentReco from '@/views/components/epaymentreco'
import SVCReset from '@/views/components/svcreset'
import SRReset from '@/views/components/srreset'
import maintenance from '@/views/components/maintenance'
import bulkremittancequery from '@/views/components/bulkremittancequery'
import delivaryStatusReport from '@/views/components/delivaryStatusReport'
import DtoIReport from '@/views/components/DtoIReport'
import PaymentModeChange from '@/views/components/PaymentModeChange'
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
          name: 'SVC Closure',
          component: SVCClosureP2P,
          meta: {
            requiresAuth: true,
            adminAuth: true,
            breadcrumb: [{
                name: 'Home',
                link: '/dashboard'
              },
              {
                name: "Yesterday's Closure Of SVC"
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
                link: '/dashboard'
              },
              {
                name: "SR Day Closure"
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
                link: '/dashboard'
              },
              {
                name: 'SR Closure Search'
              }
            ]
          },
        },
        {
          path: 'hubwisecodreport',
          name: 'Hub Wise Report',
          component: HubWiseCODReport,
          meta: {
            requiresAuth: true,
            adminAuth: true,
            breadcrumb: [{
                name: 'Home',
                link: '/dashboard'
              },
              {
                name: 'Hub Wise COD Report'
              }
            ]
          },
        },
        {
          path: 'invoice',
          name: 'Invoice',
          component: Invoice,
          meta: {
            requiresAuth: true,
            adminAuth: true,
            breadcrumb: [{
                name: 'Home',
                link: '/dashboard'
              },
              {
                name: 'Invoice'
              }
            ]
          },
        },
        {
          path: 'invoicereport',
          name: 'Invoice Report',
          component: InvoiceReport,
          meta: {
            requiresAuth: true,
            adminAuth: true,
            breadcrumb: [{
                name: 'Home',
                link: '/dashboard'
              },
              {
                name: 'Invoice Summary Report'
              }
            ]
          },
        },
        {
          path: 'deliveredtoinscan',
          name: 'Delivered To InScan',
          component: DeliveredToInScan,
          meta: {
            requiresAuth: true,
            adminAuth: true,
            breadcrumb: [{
                name: 'Home',
                link: '/dashboard'
              },
              {
                name: 'Change Shipment Status'
              }
            ]
          },
        },
        {
          path: 'paymentmode',
          name: 'Payment Mode',
          component: PaymentMode,
          meta: {
            requiresAuth: true,
            adminAuth: true,
            breadcrumb: [{
                name: 'Home',
                link: '/dashboard'
              },
              {
                name: 'Change Payment Mode'
              }
            ]
          },
        },
        {
          path: 'srsummary',
          name: 'SR Summary',
          component: SRSummary,
          meta: {
            requiresAuth: true,
            adminAuth: true,
            breadcrumb: [{
                name: 'Home',
                link: '/dashboard'
              },
              {
                name: 'SR Summary'
              }
            ]
          },
        },
        {
          path: 'awbdifference',
          name: 'AWB Difference',
          component: AWBDifference,
          meta: {
            requiresAuth: true,
            adminAuth: true,
            breadcrumb: [{
                name: 'Home',
                link: '/dashboard'
              },
              {
                name: 'AWB Difference'
              }
            ]
          },
        },
        {
          path: 'hubwisetracking',
          name: 'Hub Wise Tracking',
          component: HubWiseTracking,
          meta: {
            requiresAuth: true,
            adminAuth: true,
            breadcrumb: [{
                name: 'Home',
                link: '/dashboard'
              },
              {
                name: 'Hub Wise Tracking'
              }
            ]
          },
        },
        {
          path: 'disputereport',
          name: 'Dispute Report',
          component: DisputeReport,
          meta: {
            requiresAuth: true,
            adminAuth: true,
            breadcrumb: [{
                name: 'Home',
                link: '/dashboard'
              },
              {
                name: 'Dispute Report'
              }
            ]
          },
        },
        {
          path: 'ordertype',
          name: 'Order Type',
          component: OrderType,
          meta: {
            requiresAuth: true,
            adminAuth: true,
            breadcrumb: [{
                name: 'Home',
                link: '/dashboard'
              },
              {
                name: 'Order Type'
              }
            ]
          },
        },
        {
          path: 'srpendinglimit',
          name: 'SR Pending Limit',
          component: SRPendingLimit,
          meta: {
            requiresAuth: true,
            adminAuth: true,
            breadcrumb: [{
                name: 'Home',
                link: '/dashboard'
              },
              {
                name: 'SR Pending Limit'
              }
            ]
          },
        },
        {
          path: 'codoutstandingreport',
          name: 'COD Outstanding',
          component: CODOutstandingReport,
          meta: {
            requiresAuth: true,
            adminAuth: true,
            breadcrumb: [{
                name: 'Home',
                link: '/dashboard'
              },
              {
                name: 'COD Outstanding Report'
              }
            ]
          },
        },
        {
          path: 'paymentreport',
          name: 'Payment Report',
          component: PaymentReport,
          meta: {
            requiresAuth: true,
            adminAuth: true,
            breadcrumb: [{
                name: 'Home',
                link: '/dashboard'
              },
              {
                name: 'Payment Report'
              }
            ]
          },
        },
        {
          path: 'AutoRemittance',
          name: 'Auto Remittance',
          component: AutoRemittance,
          meta: {
            requiresAuth: true,
            adminAuth: true,
            breadcrumb: [{
                name: 'Home',
                link: '/dashboard'
              },
              {
                name: 'Auto COD Remittance'
              }
            ]
          },
        },
        {
          path: 'ManualRemittance',
          name: 'Manual Remittance',
          component: ManualRemittance,
          meta: {
            requiresAuth: true,
            adminAuth: true,
            breadcrumb: [{
                name: 'Home',
                link: '/dashboard'
              },
              {
                name: 'Manual COD Remittance'
              }
            ]
          },
        },
        {
          path: 'LongTailClient',
          name: 'Long Tail Client',
          component: LongTailClient,
          meta: {
            requiresAuth: true,
            adminAuth: true,
            breadcrumb: [{
                name: 'Home',
                link: '/dashboard'
              },
              {
                name: 'Long Tail Client'
              }
            ]
          },
        },
        {
          path: 'EPaymentReco',
          name: 'E-Payment Reco',
          component: EPaymentReco,
          meta: {
            requiresAuth: true,
            adminAuth: true,
            breadcrumb: [{
                name: 'Home',
                link: '/dashboard'
              },
              {
                name: 'E-Payment Reconciliation'
              }
            ]
          },
        },
        {
          path: 'svcledger',
          name: 'SVC Ledger',
          component: SVCReset,
          meta: {
            requiresAuth: true,
            adminAuth: true,
            breadcrumb: [{
                name: 'Home',
                link: '/dashboard'
              },
              {
                name: 'Reset SVC Ledger'
              }
            ]
          },
        },
        {
          path: 'bulkremittancequery',
          name: 'Bulk Remittance Query',
          component: bulkremittancequery,
          meta: {
            requiresAuth: true,
            adminAuth: true,
            breadcrumb: [{
                name: 'Home',
                link: '/dashboard'
              },
              {
                name: 'Bulk Remittance Query'
              }
            ]
          },
        },
        {
          path: 'srledger',
          name: 'SR Ledger',
          component: SRReset,
          meta: {
            requiresAuth: true,
            adminAuth: true,
            breadcrumb: [{
                name: 'Home',
                link: '/dashboard'
              },
              {
                name: 'Reset SR Ledger'
              }
            ]
          },
        },
        {
          path: 'AddEditClientTAT',
          name: 'Add/Edit Remittance TAT',
          component: AddEditClientTAT,
          meta: {
            requiresAuth: true,
            adminAuth: true,
            breadcrumb: [{
                name: 'Home',
                link: '/dashboard'
              },
              {
                name: 'Add/Edit Remittance TAT'
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
                link: '/dashboard'
              },
              {
                name: 'SVC Closure Search'
              }
            ]
          },
        },
        {
          path: 'CODRemitanceClose',
          name: 'Closed Remittance',
          component: CODRemitanceClose,
          meta: {
            requiresAuth: true,
            adminAuth: true,
            breadcrumb: [{
                name: 'Home',
                link: '/dashboard'
              },
              {
                name: 'Closed Remittance'
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
          name: 'Bulk Upload To Close',
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
          name: 'Finance Closure',
          component: FinanceClosure,
          meta: {
            requiresAuth: true,
            adminAuth: true,
            breadcrumb: [{
                name: 'Home',
                link: '/dashboard'
              },
              {
                name: "Finance Team Closure"
              }
            ]
          },
        },
        {
          path: 'settings',
          name: 'Hub Settings',
          component: SystemSettings,
          meta: {
            requiresAuth: true,
            adminAuth: true,
            breadcrumb: [{
                name: 'Home',
                link: '/dashboard'
              },
              {
                name: 'Hub Settings'
              }
            ]
          },
        },
        {
          path: 'bankholiday',
          name: 'Bank Holiday',
          component: BankHoliday,
          meta: {
            requiresAuth: true,
            adminAuth: true,
            breadcrumb: [{
                name: 'Home',
                link: '/dashboard'
              },
              {
                name: 'Bank Holiday Settings'
              }
            ]
          },
        },
        {
          path: 'emailremittance',
          name: 'E-Mail Remittance',
          component: EMailRemittance,
          meta: {
            requiresAuth: true,
            adminAuth: true,
            breadcrumb: [{
                name: 'Home',
                link: '/dashboard'
              },
              {
                name: 'E-Mail Remittance'
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
          name: 'SVC Deposit Exceptions',
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
                link: '/dashboard'
              },
              {
                name: 'MIS P2P COD Report'
              }
            ]
          },
        },
        {
         path: 'delivaryStatusReport',
         name: 'Delivary Status Report',
         component: delivaryStatusReport,
         meta: {
           requiresAuth: true,
           adminAuth: true,
           breadcrumb: [{
               name: 'Home',
               link: '/dashboard'
             },
             {
               name: 'Delivary Status Report'
             }
           ]
         },
       },
       {
          path: 'DtoIReport',
          name: 'DtoIReport',
          component: DtoIReport,
          meta: {
              requiresAuth: true,
              adminAuth: true,
              breadcrumb: [{
                      name: 'Home',
                      link: '/dashboard'
                  },
                  {
                      name: 'Delivered To InScan Report'
                  }
              ]
            },
          },
          {
                   path: 'PaymentModeChange',
                   name: 'Payment Mode Change',
                   component: PaymentModeChange,
                   meta: {
                       requiresAuth: true,
                       adminAuth: true,
                       breadcrumb: [{
                               name: 'Home',
                               link: '/dashboard'
                           },
                           {
                               name: 'Payment Mode Change Report'
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
      path: '/login/:id?',
      name: 'login',
      component: Login
    },
    {
      path: '/maintenance',
      name: 'maintenance',
      component: maintenance
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
  var accessuserToken = window.localStorage.getItem('accessuserToken') ? window.localStorage.getItem('accessuserToken').replace(/"/g, '') : null;

  if (isLoggedIn == null) {
    isLoggedIn = false;
  } else {
    if (accessuserToken == null) {
      localStorage.removeItem('accesshubdata')
      localStorage.removeItem('accesspermissiondata')
      localStorage.removeItem('accessuserdata')
      localStorage.removeItem('accessuserToken')
      localStorage.removeItem('isLoggedIn')
      isLoggedIn = false;
    } else {
      isLoggedIn = true;
    }
  }

  if (isLoggedIn == true) {

    var userdetailEncrypt = window.localStorage.getItem('accessuserdata')
    var bytes = CryptoJS.AES.decrypt(userdetailEncrypt.toString(), 'Key');
    var plaintext = bytes.toString(CryptoJS.enc.Utf8);
    var userdetail = JSON.parse(plaintext);

    // axios.post(process.env.NODE_ENV == 'production' ? 'http://track.xbees.in/api/UserTracker' : 'http://stageiptracking.xbees.in/api/UserTracker', {
    //   projectname: "COD Management",
    //   type: "web",
    //   userid: parseInt(userdetail.userid),
    //   username: userdetail.username,
    //   routeurl: to.path,
    //   meta:{
    //     event:to.path,
    //     data:{
    //       req:'',
    //       res:''
    //     }
    //   }
    // });

    axios({
        method: 'POST',
        'url': apiUrl.api_url + 'appvalidatetoken',
        'data': {},
        headers: {
          'Authorization': 'Bearer ' + accessuserToken
        }
      })
      .then((response) => {
        /*--maintenance page call start--*/
        if (response && response.data.ReturnCode == '104') {
          next({
            path: "/maintenance"
          });
        }
        /*--maintenance page call end--*/
      }, (error) => {
        if (error.response.status === 401) {
          localStorage.removeItem('accesshubdata')
          localStorage.removeItem('accesspermissiondata')
          localStorage.removeItem('accessuserdata')
          localStorage.removeItem('accessuserToken')
          localStorage.removeItem('isLoggedIn')
          localStorage.removeItem('logoutTime')
          localStorage.removeItem('accessrole')
          next({
            path: "/login",
          });
        }
      });
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

      function isBigEnough(findURL) {
        if (findURL.children.length > 0) {
          for (var j = 0; j < findURL.children.length; j++) {
            if (findURL.children[j].ismenu === true) {
              return findURL.children.some(isBigChildEnough);
            }
          }
        }
        return findURL.name == to.name;
      }

      function isBigChildEnough(findURL) {
        return findURL.name == to.name;
      }

      const setroles = permissiondata.some(isBigEnough);
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
