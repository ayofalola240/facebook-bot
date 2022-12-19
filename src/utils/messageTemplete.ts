import axios from 'axios';
export const sendCategoriesTemplate = async () => {
  let products = [];
  try {
    const res: any = await axios({
      url: 'https://fakestoreapi.com/products',
      method: 'GET',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept-Encoding': '*',
      },
    });
    products = res.data;
  } catch (error) {
    console.log(`An error occur in api ${JSON.stringify(error)}`);
  }

  const elements = products
    .map((product) => {
      return {
        title: product.title,
        image_url: product.image,
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
    })
    .slice(0, 3);
  const template = {
    attachment: {
      type: 'template',
      payload: {
        template_type: 'generic',
        elements: [...elements],
      },
    },
  };

  return JSON.stringify(template);
};
