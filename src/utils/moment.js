import 'dayjs/locale/vi';

import relativeTime from 'dayjs/plugin/relativeTime';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';

import dayjs from 'dayjs';

dayjs.locale('en');

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(relativeTime);
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);

dayjs.tz.setDefault('Asia/Singapore');

export const FORMAT_DATE = 'DD/MM/YYYY';

export default dayjs;
