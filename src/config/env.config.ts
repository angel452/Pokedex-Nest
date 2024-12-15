// Note: No se esta usando por ahora...
export const EnvConfiguration = () => ({
  enviroment: process.env.NODE_ENV || 'dev',
  mongodb: process.env.MONGODB,
  port: process.env.PORT || 3002,
});

// Ejemplo de uso...
/*
// [+] No olvides importar el modulo "ConfigModule"
//     en el archivo "...module.ts"
number = configService.get<number>('port');
*/
