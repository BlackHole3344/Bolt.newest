import { auth } from '@webcontainer/api';


export const InitWebContainer = () => {
    return auth.init({
        clientId: 'wc_api_black_hole3344_f2602e7d3a7251f5c414c6d956cfaadf',
        scope: '',
      });
}
