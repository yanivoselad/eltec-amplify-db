import type {AppSyncIdentityCognito} from 'aws-lambda';
import { ObjectId } from 'mongodb';
import type {Schema} from './resource'
import {connectToMongodb} from "./mdbUtils";


function successResponse(body: any): object {
    return {
        statusCode: 200,
        count: body,
    };
}
function errorResponse(err: Error): object {
    const errorMessage = err.message;
    return {
        statusCode: 400,
        body: errorMessage,
        headers: {
            'Content-Type': 'application/json',
        },
    };
}
export const handler: Schema["updateTodo"]['functionHandler'] = async (event, context) => {
    
    console.log("got event: " + JSON.stringify(event));
    // console.log("got context: " + JSON.stringify(context));
    // Connect to MongoDB
    const [client, , collection] = connectToMongodb();
    try {

        console.log('Connected to MongoDB');
        let user = null;
        if ((event.identity as AppSyncIdentityCognito).username)
        user = (event.identity as AppSyncIdentityCognito).username;


        const payload = {content: event.arguments.content, username: user};
        const documentId = new ObjectId(event.arguments._id!);
        const updateResult = await collection.updateOne({ _id: documentId, username: user}, { $set: payload });

        return successResponse(updateResult);
    } catch (e) {
        console.log("got error: " + e);
        return errorResponse(e as Error);
    } finally {
        if (client) {
            await client.close();
        }
    }
};