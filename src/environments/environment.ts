// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `angular-cli.json`.

export const environment = {
  production: false,
  apiUrl: 'http://localhost:8081/spring',
  stripePublicKey: 'pk_test_51RDW4JHkFUsq9WIVP1V0F0aHVWvZJ2pfUqZgvlj1fy9VA9g6UBu1g9XexsCCBsk3UzPdN4sm3gDA9Y7mBz9YDeww007xvVFldp',
  stripeSecretKey: 'sk_test_51RDW4JHkFUsq9WIVRwBR32QLTdp8u48B4IBn7AxUeJOr7k4Fpmw6Hp2HASx7sLIWaE5DSkuyCtKjpE8v9YwQvkKN004KykOJe1'
};
