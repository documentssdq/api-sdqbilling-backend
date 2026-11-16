const CANONICAL_ALIASES = {
  dashboard: 'dashboard',
  dashboards: 'dashboard',
  user: 'users',
  users: 'users',
  group: 'groups',
  groups: 'groups',
  groupaccess: 'groupaccess',
  permission: 'permissions',
  permissions: 'permissions',
  activity: 'activities',
  activities: 'activities',
  activitylog: 'activities',
  activitylogs: 'activities',
  setting: 'settings',
  settings: 'settings',
  purchase: 'purchase',
  purchases: 'purchase',
  purchaseorder: 'purchaseorder',
  purchaseorders: 'purchaseorder',
  saleorder: 'saleorder',
  saleorders: 'saleorder',
  party: 'partys',
  partys: 'partys',
  parties: 'partys',
  service: 'services',
  services: 'services',
  category: 'categorys',
  categorys: 'categorys',
  categories: 'categorys',
  subcategory: 'subcategorys',
  subcategorys: 'subcategorys',
  subcategories: 'subcategorys',
  taxrate: 'taxrate',
  taxrates: 'taxrate',
  unit: 'unit',
  units: 'unit',
  currency: 'currency',
  currencys: 'currency',
  currencies: 'currency',
  country: 'countries',
  countries: 'countries',
  countriess: 'countries',
  city: 'city',
  citys: 'city',
  cities: 'city',
  state: 'state',
  states: 'state',
  page: 'pages',
  pages: 'pages',
  widget: 'widgets',
  widgets: 'widgets',
  emailtemplate: 'emailtemplate',
  emailtemplates: 'emailtemplate',
  smstemplate: 'smstemplate',
  smstemplates: 'smstemplate',
};

const CANONICAL_URL_MAP = {
  dashboard: '/admin/dashboard',
  users: '/admin/users',
  groups: '/admin/groups',
  groupaccess: '/admin/group-access',
  permissions: '/admin/groups/permissions',
  activities: '/admin/activities',
  settings: '/admin/settings',
  purchase: '/admin/purchase',
  purchaseorder: '/admin/purchaseorder',
  saleorder: '/admin/saleorder',
  partys: '/admin/party',
  services: '/admin/service',
  categorys: '/admin/category',
  subcategorys: '/admin/subcategory',
  taxrate: '/admin/taxrate',
  unit: '/admin/unit',
  currency: '/admin/currency',
  countries: '/admin/countries',
  city: '/admin/city',
  state: '/admin/state',
  pages: '/admin/page',
  widgets: '/admin/widget',
  emailtemplate: '/admin/emailtemplate',
  smstemplate: '/admin/smstemplate',
};

const normalizeExactModuleKey = (name) =>
  String(name || '').trim().toLowerCase();

const normalizeModuleKey = (name) => {
  const compact = String(name || '')
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, '');
  if (!compact) return '';
  return CANONICAL_ALIASES[compact] || compact;
};

const isSameModuleName = (left, right) => {
  const exactLeft = normalizeExactModuleKey(left);
  const exactRight = normalizeExactModuleKey(right);
  if (!exactLeft || !exactRight) return false;
  if (exactLeft === exactRight) return true;
  return normalizeModuleKey(left) === normalizeModuleKey(right);
};

const getDefaultModuleUrl = (name) => {
  const canonical = normalizeModuleKey(name);
  return CANONICAL_URL_MAP[canonical] || '';
};

module.exports = {
  normalizeExactModuleKey,
  normalizeModuleKey,
  isSameModuleName,
  getDefaultModuleUrl,
};

