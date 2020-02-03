import React from 'react';

const Transaction = ({ transaction }) => {
    let displayTo = '', displayFrom = '', displayAmount = '', seperateDisplayToHTML, seperateDisplayAmountHTML;
    const { input, outputMap } = transaction;
    const recipients    = Object.keys(outputMap);
    
    displayFrom   = input.address.length > 32 ? `${input.address.substring(0,32)}...` : input.address;

    if(recipients.length !== 1) {
        for(let i=0; i<recipients.length; i++) {
            if(recipients[i]   !== input.address) {
                let d           = recipients[i].length > 32 ? `${recipients[i].substring(0,32)}...` : recipients[i];
                displayTo       = displayTo + d + ",";
            
                let a           = outputMap[recipients[i]];
                displayAmount   = displayAmount + a + ","; 
            }
        }
        seperateDisplayToHTML       = displayTo.split(',').map((line)=><div key={line}>{line}</div>);
        seperateDisplayAmountHTML   = displayAmount.split(',').map((line)=><div key={line}>{line}</div>);
    }
    else {
        seperateDisplayToHTML     = recipients[0].length > 32 ? `${recipients[0].substring(0,32)}...` : recipients[0];
        seperateDisplayAmountHTML = outputMap[recipients[0]];
    }

    return (
        <tr key={transaction.id}>
            <td>{displayFrom}</td>
            <td>{seperateDisplayToHTML}</td>
            <td>{seperateDisplayAmountHTML}</td>
        </tr>
    )
}

export default Transaction;