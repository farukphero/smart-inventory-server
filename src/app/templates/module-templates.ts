export const interfaceTemplate = `
import { Document, Model } from 'mongoose';

export interface I{{moduleNameUpperCase}} extends Document {
    // Define {{moduleName}} interface properties here
}

export interface I{{moduleNameUpperCase}}Model extends Model<I{{moduleNameUpperCase}}> {
    // Define model methods here
}
`;

export const controllerTemplate = `
import { RequestHandler} from 'express';
import { {{moduleName}}Service } from './{{moduleName}}.service';
import httpStatus from 'http-status';
import sendResponse from '../../utils/sendResponse';
import catchAsync from '../../utils/catchAsync';

const getAll{{moduleNameUpperCase}}: RequestHandler = catchAsync(async (req, res) => {
  const result = await {{moduleName}}Service.getAll{{moduleNameUpperCase}}(req.query); 

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: '{{moduleNameUpperCase}} retrieved successfully',
    data: result.data,
    meta: result.meta
  });
});

const get{{moduleNameUpperCase}}ById: RequestHandler = catchAsync(async (req, res) => {
  const result = await {{moduleName}}Service.get{{moduleNameUpperCase}}ById(req.params.id); 

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: '{{moduleNameUpperCase}} retrieved successfully',
    data: result
  });
});

const create{{moduleNameUpperCase}}: RequestHandler = catchAsync(async (req, res) => {
  const result = await {{moduleName}}Service.create{{moduleNameUpperCase}}(req); 

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: '{{moduleNameUpperCase}} created successfully',
    data: result
  });
});

const update{{moduleNameUpperCase}}: RequestHandler = catchAsync(async (req, res) => {
  const result = await {{moduleName}}Service.update{{moduleNameUpperCase}}(req.params.id, req); 

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: '{{moduleNameUpperCase}} updated successfully',
    data: result
  });
});

const delete{{moduleNameUpperCase}}: RequestHandler = catchAsync(async (req, res) => {
  await {{moduleName}}Service.delete{{moduleNameUpperCase}}(req.params.id); 

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: '{{moduleNameUpperCase}} deleted successfully',
    data: null
  });
});

export const {{moduleName}}Controller = {
  getAll{{moduleNameUpperCase}},
  get{{moduleNameUpperCase}}ById,
  create{{moduleNameUpperCase}},
  update{{moduleNameUpperCase}},
  delete{{moduleNameUpperCase}}
};
`;

export const serviceTemplate = `

import {{moduleNameUpperCase}} from './{{moduleName}}.model';
import { I{{moduleNameUpperCase}} } from './{{moduleName}}.interface';
import QueryBuilder from '../../builder/QueryBuilder';
import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { Request } from 'express';

export const getAll{{moduleNameUpperCase}} = async ( query: Record<string, unknown>):Promise<(any)> => {
  try {
    const {{moduleName}}SearchableFields = ['name'];

  const {{moduleName}}Query = new QueryBuilder(
    {{moduleNameUpperCase}}.find({
      isDeleted: false
    }),
    query
  )
    .search({{moduleName}}SearchableFields)
    .filter()
    .sort()
    .paginate()
    .fields();

  const meta = await {{moduleName}}Query.countTotal();
  const result = await {{moduleName}}Query.queryModel;

  return { meta, result };
  }
  catch (error) {
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, "Internal Server Error");
  }
};

export const get{{moduleNameUpperCase}}ById = async (id: string):Promise<I{{moduleNameUpperCase}} | null> => {
 try {
  const {{moduleName}} = await {{moduleNameUpperCase}}.findOne({ _id: id, isDeleted: false });
  if (!{{moduleName}}) {
    throw new AppError(httpStatus.NOT_FOUND, "This {{moduleName}} is not found");
  }
  return {{moduleName}};
  }
  catch (error) {
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, "Internal Server Error");
  }
};

export const create{{moduleNameUpperCase}} = async (req: Request):Promise<I{{moduleNameUpperCase}} | null> => {
 try {
  const result = await {{moduleNameUpperCase}}.create(req.body);
  return result;
  }
  catch (error) {
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, "Internal Server Error");
  }
};

export const update{{moduleNameUpperCase}} = async (id: string, req: Request):Promise<I{{moduleNameUpperCase}} | null> => {

  try {
    const {{moduleName}} = await {{moduleNameUpperCase}}.findOne({ _id: id, isDeleted: false });
  if (!{{moduleName}}) {
    throw new AppError(httpStatus.NOT_FOUND, "This {{moduleName}} does not exist");
  }
  
  const { ...remainingStudentData } = req.body;
  const modifiedUpdatedData: Record<string, unknown> = {
    ...remainingStudentData
  };

  const result = await {{moduleNameUpperCase}}.findByIdAndUpdate(id, modifiedUpdatedData, { new: true, runValidators: true});

  return result;
  }
  catch (error) {
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, "Internal Server Error");
  }
};

export const delete{{moduleNameUpperCase}} = async (id: string):Promise<void | null> => {
  
 try {
  const {{moduleName}} = await {{moduleNameUpperCase}}.findOne({ _id: id, isDeleted: false });
  if (!{{moduleName}}) {
    throw new AppError(httpStatus.NOT_FOUND, "This {{moduleName}} is not found");
  }

  await {{moduleNameUpperCase}}.findByIdAndUpdate( id, { isDeleted: true,deletedAt: new Date() }, { new: true });

  return null;
  }
  catch (error) {
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, "Internal Server Error");
  }
};

export const {{moduleName}}Service = {
  getAll{{moduleNameUpperCase}},
  get{{moduleNameUpperCase}}ById,
  create{{moduleNameUpperCase}},
  update{{moduleNameUpperCase}},
  delete{{moduleNameUpperCase}}
};
`;

export const modelTemplate = ` 
import { Schema, model } from 'mongoose';
import { I{{moduleNameUpperCase}} , I{{moduleNameUpperCase}}Model } from './{{moduleName}}.interface';

const {{moduleName}}Schema = new Schema<I{{moduleNameUpperCase}},I{{moduleNameUpperCase}}Model>({
  // Define {{moduleName}} schema properties here
});

const {{moduleNameUpperCase}} = model<I{{moduleNameUpperCase}}, I{{moduleNameUpperCase}}Model>('{{moduleNameUpperCase}}', {{moduleName}}Schema);
export default {{moduleNameUpperCase}};
`;

export const routerTemplate = `
import { Router } from 'express';
import { {{moduleName}}Controller } from './{{moduleName}}.controller';

const router = Router();

router.get('/all', {{moduleName}}Controller.getAll{{moduleNameUpperCase}});
router.get('/:id', {{moduleName}}Controller.get{{moduleNameUpperCase}}ById);
router.post('/create', {{moduleName}}Controller.create{{moduleNameUpperCase}});
router.put('/update/:id', {{moduleName}}Controller.update{{moduleNameUpperCase}});
router.delete('/:id', {{moduleName}}Controller.delete{{moduleNameUpperCase}});

export const {{moduleName}}Routes = router;
`;

export const validationTemplate = `
import * as z from 'zod';

export const create{{moduleNameUpperCase}}Schema = z.object({
  // Define create{{moduleNameUpperCase}} schema properties here
});

export const update{{moduleNameUpperCase}}Schema = z.object({
  // Define update{{moduleNameUpperCase}} schema properties here
});
`;

export const swaggerTemplate = `
swagger: '3.1.0'
info:
  title: Your API Documentation
  version: 1.0.0
paths:

`;
