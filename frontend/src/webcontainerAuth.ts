import { auth } from '@webcontainer/api';


export const InitWebContainer = () => {
    return auth.init({
        clientId: 'wc_api_black_hole3344_d950ec2139d244b59bd240adb5d7fd52',
        scope: '',
      });
}
