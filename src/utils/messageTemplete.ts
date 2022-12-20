import axios from 'axios';
export const sendProductsTemplate = async () => {
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
            type: 'postback',
            title: 'View Product',
            payload: `PRODUCT_${product.id}`,
          },
        ],
      };
    })
    .slice(0, 5);
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

export const sendProductTemplate = async (productId: any) => {
  let product: any;
  try {
    const res: any = await axios({
      url: `https://fakestoreapi.com/products/${productId}`,
      method: 'GET',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept-Encoding': '*',
      },
    });
    product = res.data;
  } catch (error) {
    console.log(`An error occur in api ${JSON.stringify(error)}`);
  }

  const template = {
    attachment: {
      type: 'template',
      payload: {
        template_type: 'generic',
        elements: [
          {
            title: product.title,
            image_url: product.image,
            subtitle: `$${product.price}`,
            default_action: {
              type: 'web_url',
              url: `https://fakestoreapi.com/products/${productId}`,
            },
            buttons: [
              {
                type: 'postback',
                title: 'Add to Cart',
                payload: `CART_${productId}`,
              },
              {
                type: 'postback',
                title: 'Back to categories',
                payload: 'BACK_TO_PRODUCTS',
              },
            ],
          },
        ],
      },
    },
  };
  return JSON.stringify(template);
};
