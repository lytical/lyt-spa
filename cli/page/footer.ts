/* @preserve
  (c) 2019 lytical, inc. all rights are reserved.
  lytical(r) is a registered trademark of lytical, inc.
  please refer to your license agreement on the use of this file.
*/

import { is_component, component, data } from '../component';

interface link {
  to: string;
  caption: string;
  title: string;
}

interface model {
  year: number;
  link: link[];
}

@is_component({
  html: 'page/footer.html'
})
export class page_footer implements component, model {
  init_data(data: model) {
    data.link.push(...[
      {
        to: '/site/terms',
        caption: 'Terms of Use',
        title: 'view our terms of use statement.'
      },
      {
        to: '/site/privacy',
        caption: 'Privacy',
        title: 'view our privacy statement.'
      },
      {
        to: '/site/about-us',
        caption: 'About Us',
        title: 'view information about us.'
      },
      {
        to: '/site/contact-us',
        caption: 'Contact Us',
        title: 'view information and choices on how to contact us.'
      }
    ]);
  }

  @data(new Date(Date.now()).getUTCFullYear()) year!: number;
  @data([]) link!: link[];
}