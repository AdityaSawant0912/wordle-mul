import type { NextApiRequest, NextApiResponse } from 'next'
import User from '../../../models/user'
import { hash } from 'bcryptjs';

type Data = {
  status: string,
  error?: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {

  if (req.method !== 'POST') { res.status(400).json({ status: "NotOK", error: "This is a POST method API" }); return; }

  let duplicateUser = await User.findOne({ email: req.body.email })
  
  if (duplicateUser) { res.status(400).json({ status: "NotOK", error: "User with this Email Id already Exists" }); return; }
  
  let user = await User.create({ username: req.body.username, email: req.body.email, password: await hash(req.body.password, 10)});

  if (!user) { res.status(500).json({ status: "NotOK", error: "User Creation Failed" }); return; }

  res.status(200).json({ status: "OK" })
}
