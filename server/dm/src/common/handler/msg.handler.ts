export const msgHandler = (data: {
  method: string;
  whereFrom: string;
  content: any;
}) => {
  console.log(data);
};
