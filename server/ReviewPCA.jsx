import React, { useContext, useEffect, useState } from 'react';
import { FormContext, AuthContext } from './Root1';
import { useMsal } from '@azure/msal-react';

const ReviewPCA = () => {
  const { formData } = useContext(FormContext);
  const { loggedUser, userProfile, fetchUserData } = useContext(AuthContext);
  const { instance } = useMsal();
  const [fetchedEmpEmail, setFetchedEmpEmail] = useState('');
  const [fetchedSupEmail, setFetchedSupEmail] = useState('');

    const descriptions = {
        client: 'Client',
        employee: 'Employee',
        empEmail: 'Employee Email',
        position: 'Position',
        role: 'Role',
        department: 'Department',
        supervisor: 'Supervisor',
        supEmail: 'Supervisor Email',
        score: 'Score',
        startDate: 'Start Date',
        endDate: 'End Date',
        // empComments: 'Employee Comments',
        empStrengths: 'Employee Strengths',
        empDevAreas: 'Employee Development Areas',
        // supComments: 'Supervisor Comments',
        supImprovements: 'Supervisor Improvements',
        supDevPlan:'Development Plan',
        didSupGiveBriefing:"Was client briefing done by Supervisor before commencement of work?",
        whatDidYouLearn:'What did you learn on this Audit?',
        adequateTrainingReceived:"Did you receive adequate on-the-job training from your Supervisor?",
        clientKnowledgegReceived:"Did you have sufficient knowledge of the client to enable you to properly complete the work assigned to you?",
        devAreasIDbySup:'What developmental areas were identified by your Supervisor in this Audit? (Refer to Supervisor comments on Post Client Assessment Form)',
        devAreasIDInPrevAssess:'What developmental areas identified in previous performance assessments have you addressed on this Audit?',
        pcaStatus:"PCA Status",
        id:"PCA ID"

      };

      // Tax department specific fields to display
      const taxDepartmentFields = [
        'agreement',
        'client',
        'employee',
        'empEmail',
        'position',
        'department',
        'supervisor',
        'supEmail',
        'score',
        'startDate',
        'endDate',
        'duration',
        'empStrengths',
        'empDevAreas',
        'supImprovements',
        'supDevPlan',
        'pcaStatus',
        'id',
        'SubmittedOn'

      ];

      // Function to determine if a field should be displayed for Tax department
      const shouldDisplayFieldForTax = (fieldKey) => {
        return taxDepartmentFields.includes(fieldKey);
      };

      // Function to determine if we should show Tax-specific display or default
      const isTaxDepartment = formData.department === 'Tax';
      
      // Check if current user is HR or Supervisor
      const isHROrSupervisor = userProfile?.isSupervisor || userProfile?.isInHR;
      
      // Fetch email by display name using Graph API search
      const fetchEmailByName = async (displayName) => {
        if (!displayName) return '';
        
        try {
          const accounts = instance.getAllAccounts();
          if (accounts.length === 0) return '';
          
          const accessTokenRequest = {
            scopes: ['https://graph.microsoft.com/User.Read.All'],
            account: accounts[0]
          };
          
          const accessTokenResponse = await instance.acquireTokenSilent(accessTokenRequest);
          const accessToken = accessTokenResponse.accessToken;
          
          const searchUrl = `https://graph.microsoft.com/v1.0/users?$filter=displayName eq '${displayName}'&$select=mail,userPrincipalName,displayName`;
          
          const response = await fetch(searchUrl, {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            }
          });
          
          const data = await response.json();
          console.log('Graph API search result for', displayName, ':', data);
          
          if (data.value && data.value.length > 0) {
            const user = data.value[0];
            return user.mail || user.userPrincipalName || '';
          }
          
          return '';
        } catch (error) {
          console.error('Error fetching email by name:', error);
          return '';
        }
      };


      
      useEffect(()=>{
        console.log("::::::::::::::::::::The final Review Form Data:::::::::::::::::::::", formData)
        if (formData.startDate && formData.startDate.includes('T')) {
          formData.startDate = formData.startDate.split('T')[0];
        }
        if (formData.endDate && formData.endDate.includes('T')) {
          formData.endDate = formData.endDate.split('T')[0];
        }
        if (formData.SubmittedOn?.includes("T")) {
             formData.SubmittedOn = formData.SubmittedOn.split("T")[0];
         }
         
         // Fetch emails based on names for all users
         if (formData.employee) {
           console.log('Fetching email for employee:', formData.employee);
           fetchEmailByName(formData.employee).then((email) => {
             console.log('Fetched employee email:', email);
             if (email) {
               setFetchedEmpEmail(email);
             }
           });
         }
         
         if (formData.supervisor) {
           console.log('Fetching email for supervisor:', formData.supervisor);
           fetchEmailByName(formData.supervisor).then((email) => {
             console.log('Fetched supervisor email:', email);
             if (email) {
               setFetchedSupEmail(email);
             }
           });
         }
      },[formData.employee, formData.supervisor]);
  return (
    <>
    {/* <span>{` [${userCurrentRole}]`}</span> */}
    
    <style>
      {`
        .gradient-bg {
            background: linear-gradient(135deg, #667eea, #764ba2) !important;
            color: #fff !important;
         }
        .rounded-top-lg {
            border-top-left-radius: 1rem !important;
            border-top-right-radius: 1rem !important;
        }
        .review-table th, .review-table td {
            border: 1px solid #e9ecef !important;
        }
        .review-table {
            box-shadow: 0 4px 20px rgba(0,0,0,0.08) !important;
            border-radius: 1rem 1rem 0 0 !important;
            overflow: hidden;
        }
        .review-table th {
            border-bottom: none !important;
            box-shadow: none !important;
        }
        .review-table thead th {
            border-bottom: 1px solid #e9ecef !important;
        }
        .review-table tbody tr:first-child td {
            border-top: none !important;
        }
        .review-table .gradient-cell {
            background: linear-gradient(135deg, #667eea, #764ba2) !important;
            color: #fff !important;
        }
        .review-table .value-cell {
            background: #f8f9fa !important;
        }
        /* Alternating row backgrounds */
        .review-table tbody tr:nth-child(odd) td {
            background: #fff !important;
        }
        .review-table tbody tr:nth-child(even) td {
            background: #f8f9fa !important;
        }
      `}
    </style>

    <table className="table review-table border ">
      <thead>
       <tr>
        <th colSpan="2" className="gradient-bg rounded-top-lg">Review Post Client Assessment</th>
        </tr> 

     </thead>  
      <tbody>
        <tr>
          <td className="bg-light text-start">Agreement</td>
          <td className="d-flex bg-light border border-secondary">
            <span className={"badge " + (formData.employeeAgree?" bg-success ":" bg-danger ") + " col me-2 p-2"}>{'Employee '+(formData.employeeAgree?'[ AGREES ]':'[DISAGREES]')}</span>
            <span className={"badge " + (formData.supervisorAgree?" bg-success ":" bg-danger ") + " col p-2"}>{'Supervisor '+(formData.supervisorAgree?'[ AGREES ]':'[DISAGREES]')}</span>
          </td>
        </tr>
        {/* Display Duration for Tax department */}
        {isTaxDepartment && formData.startDate && formData.endDate && (
          <tr>
            <td className="text-wrap text-start"><span>Assignment Duration</span></td>
            <td className="text-wrap text-end value-cell">
              <span>
                {(() => {
                  const start = new Date(formData.startDate);
                  const end = new Date(formData.endDate);
                  const durationDays = Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;
                  return durationDays > 0 ? `${durationDays} day${durationDays !== 1 ? 's' : ''}` : '0 days';
                })()}
              </span>
            </td>
          </tr>
        )}
        {Object.entries(formData).map(([key, value]) => {
          // If Tax department, only show fields in taxDepartmentFields list
          if (isTaxDepartment && !shouldDisplayFieldForTax(key)) {
            return null;
          }
          
          // If not Tax department, show all fields except those specific to Tax only
          if (!isTaxDepartment && !descriptions[key]) {
            return null;
          }

          // Get the display label, using Tax-specific titles if applicable
          let displayLabel = descriptions[key];
          if (isTaxDepartment) {
            if (key === 'empStrengths') {
              displayLabel = 'Areas of Strength';
            } else if (key === 'empDevAreas') {
              displayLabel = 'Areas of Weakness';
            } else if (key === 'position') {  
              displayLabel = 'Job Position';
            } else if (key === 'supImprovements') {
              displayLabel = 'Areas to Improve';
            } else if (key === 'SubmittedOn') {
              displayLabel = 'Date Submitted for Review';
            }
          }

          return displayLabel==''||displayLabel==undefined?<span key={key}></span>:
          (
          <tr key={key}>
            <td className="text-wrap text-start"><span>{displayLabel==''||displayLabel==undefined?key:displayLabel}</span></td>
            <td className="text-wrap text-end value-cell">
              <span>
                {(() => {
                  // Use formData values and MSAL fallback for emails only
                  if (key === 'employee') {
                    return value || '';
                  }
                  if (key === 'empEmail') {
                    if (fetchedEmpEmail) {
                      console.log('Using fetched employee email:', fetchedEmpEmail);
                      return fetchedEmpEmail + 'from MSAL';
                    }
                    return '';
                  }
                  if (key === 'supervisor') {
                    return value || '';
                  }
                  if (key === 'supEmail') {
                    if (fetchedSupEmail) {
                      return fetchedSupEmail + ' from MSAL';
                    }
                    return '';
                  }
                  
                  if (typeof value === 'boolean') {
                    return value === true ? 'Yes' : 'No';
                  }
                  return value || '';
                })()}
              </span>
            </td>
          </tr>
          );
        })}
      </tbody>
    </table>
    </>
  );
};

export default ReviewPCA;