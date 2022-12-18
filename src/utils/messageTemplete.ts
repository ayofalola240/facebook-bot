import axios from 'axios';
export const sendCategoriesTemplate = async () => {
  let products = [];
  products = await axios.get('https://fakestoreapi.com/products');
  const elements = products.map((product) => {
    return {
      title: product.title,
      image: product.image,
      subtitle: product.description,
      default_action: {
        type: 'web_url',
        url: `https://fakestoreapi.com/products/${product.id}`,
        webview_height_ratio: 'tall',
      },
      buttons: [
        {
          type: 'web_url',
          url: 'https://bit.ly/webHeadphones',
          title: 'Add to cart',
        },
      ],
    };
  });

  return {
    attachment: {
      type: 'template',
      payload: {
        template_type: 'generic',
        elements: [...elements],
      },
    },
  };
  // return {
  //   attachment: {
  //     type: 'template',
  //     payload: {
  //       template_type: 'generic',
  //       elements: [
  //         {
  //           title: 'Headphones',
  //           image_url: 'https://bit.ly/imageHeadphones',
  //           subtitle: 'Bose Noise Cancelling Wireless Bluetooth Headphones',
  //           default_action: {
  //             type: 'web_url',
  //             url: 'https://bit.ly/webHeadphones',
  //             webview_height_ratio: 'tall',
  //           },
  //           buttons: [
  //             {
  //               type: 'web_url',
  //               url: 'https://bit.ly/webHeadphones',
  //               title: 'View on Website',
  //             },
  //             {
  //               type: 'postback',
  //               title: 'Show Headphones',
  //               payload: 'SHOW_HEADPHONES',
  //             },
  //           ],
  //         },
  //         {
  //           title: 'TV',
  //           image_url: 'https://bit.ly/imageTV',
  //           subtitle: 'Master of quality & Incredible clarity',
  //           default_action: {
  //             type: 'web_url',
  //             url: 'https://bit.ly/webTelevision',
  //             webview_height_ratio: 'tall',
  //           },
  //           buttons: [
  //             {
  //               type: 'web_url',
  //               url: 'https://bit.ly/webTelevision',
  //               title: 'View on Website',
  //             },
  //             {
  //               type: 'postback',
  //               title: 'Show TVs',
  //               payload: 'SHOW_TV',
  //             },
  //           ],
  //         },
  //         {
  //           title: 'Playstation',
  //           image_url: 'https://bit.ly/imagePlaystation',
  //           subtitle: 'Incredible games & Endless entertainment',
  //           default_action: {
  //             type: 'web_url',
  //             url: 'https://bit.ly/webPlaystation',
  //             webview_height_ratio: 'tall',
  //           },
  //           buttons: [
  //             {
  //               type: 'web_url',
  //               url: 'https://bit.ly/webPlaystation',
  //               title: 'View on Website',
  //             },
  //             {
  //               type: 'postback',
  //               title: 'Show Playstation',
  //               payload: 'SHOW_PLAYSTATION',
  //             },
  //           ],
  //         },
  //       ],
  //     },
  //   },
  // };
};
